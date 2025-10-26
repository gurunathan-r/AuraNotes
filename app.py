import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_file, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import speech_recognition as sr
from pydub import AudioSegment
import io
import tempfile
import json
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import base64

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///auranotes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.relationship('Note', backref='author', lazy=True)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    note_type = db.Column(db.String(20), nullable=False)  # 'text', 'file', 'audio'
    file_path = db.Column(db.String(500))
    transcription = db.Column(db.Text)  # For audio notes
    category = db.Column(db.String(50), default='General')
    tags = db.Column(db.String(500))  # JSON string of tags
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_shared = db.Column(db.Boolean, default=False)
    shared_with = db.Column(db.String(500))  # JSON string of user IDs

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Audio transcription function
def transcribe_audio(audio_file_path):
    try:
        # First check if ffmpeg is available when needed
        if not audio_file_path.lower().endswith('.wav'):
            import shutil
            if not shutil.which('ffmpeg'):
                return ("FFmpeg is required but not installed. Please install FFmpeg:\n"
                       "1. Download from https://ffmpeg.org/download.html\n"
                       "2. Add to your system PATH\n"
                       "3. Restart your application")
        
        r = sr.Recognizer()
        
        # Try direct recognition first (for WAV files)
        try:
            with sr.AudioFile(audio_file_path) as source:
                # Increase the ambient noise adjustment duration
                r.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = r.record(source)
                text = r.recognize_google(audio_data)
                return text
        except sr.UnknownValueError:
            return "Could not understand audio - speech not detected or audio quality too low"
        except Exception as direct_error:
            # If direct recognition fails, try FFmpeg conversion
            try:
                audio = AudioSegment.from_file(audio_file_path)
                
                # Limit audio length to 5 minutes to prevent timeout
                max_length = 5 * 60 * 1000  # 5 minutes in milliseconds
                if len(audio) > max_length:
                    audio = audio[:max_length]
                
                # Create a temporary WAV file
                import tempfile
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                    wav_path = temp_wav.name
                    audio.export(wav_path, format="wav")
                
                with sr.AudioFile(wav_path) as source:
                    r.adjust_for_ambient_noise(source, duration=0.5)
                    audio_data = r.record(source)
                    text = r.recognize_google(audio_data)
                    
                # Clean up temp file
                import os
                try:
                    os.unlink(wav_path)
                except:
                    pass
                    
                return text
                    
            except Exception as ffmpeg_error:
                # Provide more specific error messages
                error_msg = str(ffmpeg_error).lower()
                if "ffmpeg" in error_msg:
                    return "FFmpeg is required for processing this audio format. Please install FFmpeg."
                elif "duration" in error_msg:
                    return "Audio file too long - please keep files under 5 minutes"
                else:
                    return f"Could not process audio: {str(ffmpeg_error)}\nTry:\n1. Check audio file isn't corrupted\n2. Convert to WAV format\n3. Ensure clear speech audio"
                
    except sr.WaitTimeoutError:
        return "Transcription timeout - audio file may be too long or corrupted"
    except sr.UnknownValueError:
        return "Could not understand audio - please try a clearer recording"
    except sr.RequestError as e:
        return f"Transcription service error: {str(e)}"
    except Exception as e:
        return f"Error transcribing audio: {str(e)}"

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return render_template('signup.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists')
            return render_template('signup.html')
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return redirect(url_for('dashboard'))
    
    return render_template('signup.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    notes = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc()).all()
    categories = db.session.query(Note.category).filter_by(user_id=current_user.id).distinct().all()
    categories = [cat[0] for cat in categories]
    
    # Analytics
    total_notes = len(notes)
    text_notes = len([n for n in notes if n.note_type == 'text'])
    file_notes = len([n for n in notes if n.note_type == 'file'])
    audio_notes = len([n for n in notes if n.note_type == 'audio'])
    
    return render_template('dashboard.html', 
                         notes=notes, 
                         categories=categories,
                         total_notes=total_notes,
                         text_notes=text_notes,
                         file_notes=file_notes,
                         audio_notes=audio_notes)

@app.route('/create_note', methods=['POST'])
@login_required
def create_note():
    title = request.form['title']
    content = request.form['content']
    note_type = request.form['note_type']
    category = request.form.get('category', 'General')
    tags = request.form.get('tags', '')
    
    note = Note(
        title=title,
        content=content,
        note_type=note_type,
        category=category,
        tags=tags,
        user_id=current_user.id
    )
    
    # Handle file upload
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename:
            filename = secure_filename(file.filename)
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(save_path)
            # store only the filename in DB (safer and easier to serve)
            note.file_path = filename

            if note_type == 'file':
                # Read text file content
                try:
                    with open(save_path, 'r', encoding='utf-8') as f:
                        note.content = f.read()
                except Exception:
                    note.content = "Error reading file content"

            elif note_type == 'audio':
                # Transcribe audio with fallback
                try:
                    note.transcription = transcribe_audio(save_path)
                    note.content = f"Audio file: {filename}\n\nTranscription:\n{note.transcription}"
                except Exception as e:
                    # If transcription fails, still save the note
                    note.transcription = f"Transcription failed: {str(e)}"
                    note.content = f"Audio file: {filename}\n\nNote: Transcription could not be completed. You can try uploading again or add manual notes below."
    
    db.session.add(note)
    db.session.commit()
    
    flash('Note created successfully!')
    return redirect(url_for('dashboard'))

@app.route('/edit_note/<int:note_id>', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    
    if note.user_id != current_user.id:
        flash('You can only edit your own notes')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        note.title = request.form['title']
        note.content = request.form['content']
        note.category = request.form.get('category', 'General')
        note.tags = request.form.get('tags', '')
        note.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash('Note updated successfully!')
        return redirect(url_for('dashboard'))
    
    return render_template('edit_note.html', note=note)

@app.route('/delete_note/<int:note_id>')
@login_required
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    
    if note.user_id != current_user.id:
        flash('You can only delete your own notes')
        return redirect(url_for('dashboard'))
    
    if note.file_path:
        # handle legacy values that might contain full paths; use basename to be safe
        filename = os.path.basename(note.file_path)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.session.delete(note)
    db.session.commit()
    
    flash('Note deleted successfully!')
    return redirect(url_for('dashboard'))


@app.route('/uploads/<path:filename>')
@login_required
def uploaded_file(filename):
    """Serve uploaded files from the uploads folder."""
    # If a full path was stored accidentally, extract just the filename portion
    safe_filename = os.path.basename(filename)
    return send_from_directory(app.config['UPLOAD_FOLDER'], safe_filename)

@app.route('/search')
@login_required
def search():
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    
    notes_query = Note.query.filter_by(user_id=current_user.id)
    
    if query:
        # Use case-insensitive search where supported
        pattern = f"%{query}%"
        try:
            notes_query = notes_query.filter(
                db.or_(
                    Note.title.ilike(pattern),
                    Note.content.ilike(pattern),
                    Note.transcription.ilike(pattern),
                    Note.tags.ilike(pattern)
                )
            )
        except Exception:
            # Fallback for DB backends that may not support ilike
            notes_query = notes_query.filter(
                db.or_(
                    Note.title.contains(query),
                    Note.content.contains(query),
                    Note.transcription.contains(query),
                    Note.tags.contains(query)
                )
            )
    
    if category:
        notes_query = notes_query.filter_by(category=category)
    
    notes = notes_query.order_by(Note.updated_at.desc()).all()
    
    return render_template('search.html', notes=notes, query=query, category=category)

@app.route('/share_note/<int:note_id>', methods=['POST'])
@login_required
def share_note(note_id):
    note = Note.query.get_or_404(note_id)
    
    if note.user_id != current_user.id:
        flash('You can only share your own notes')
        return redirect(url_for('dashboard'))
    
    shared_with = request.form.get('shared_with', '')
    note.is_shared = True
    note.shared_with = shared_with
    
    db.session.commit()
    flash('Note shared successfully!')
    return redirect(url_for('dashboard'))

@app.route('/export_note/<int:note_id>')
@login_required
def export_note(note_id):
    note = Note.query.get_or_404(note_id)
    
    if note.user_id != current_user.id:
        flash('You can only export your own notes')
        return redirect(url_for('dashboard'))
    
    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    story = []
    story.append(Paragraph(note.title, styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Category: {note.category}", styles['Normal']))
    story.append(Paragraph(f"Created: {note.created_at.strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(note.content, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    
    return send_file(buffer, as_attachment=True, download_name=f"{note.title}.pdf", mimetype='application/pdf')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    # Allow configuring TLS cert/key paths and port via environment variables.
    # On Linux you can set SSL_CERT_FILE and SSL_KEY_FILE to enable HTTPS.
    ssl_cert = os.environ.get('SSL_CERT_FILE')
    ssl_key = os.environ.get('SSL_KEY_FILE')
    port = int(os.environ.get('PORT', '80'))

    if ssl_cert and ssl_key and os.path.exists(ssl_cert) and os.path.exists(ssl_key):
        # If user provided certs, run HTTPS. Port default for HTTPS is 443.
        if port == 80:
            port = 443
        print(f"Starting with HTTPS on port {port}")
        app.run(host='0.0.0.0', port=port, debug=True, ssl_context=(ssl_cert, ssl_key))
    else:
        print(f"Starting without TLS on port {port}. To enable TLS set SSL_CERT_FILE and SSL_KEY_FILE environment variables.")
        app.run(host='0.0.0.0', port=port, debug=True)
