# AuraNotes - Intelligent Note-Taking App

AuraNotes is a modern, feature-rich note-taking application built with Flask and Python. It allows users to create, organize, and search through notes with support for text, file uploads, and audio transcription.

## ✨ Features

### Core Features
- **Text Notes**: Create and edit rich text notes
- **File Upload**: Upload and read text files (.txt)
- **Audio Transcription**: Upload audio files (.mp3, .wav, .m4a) and get automatic transcription
- **Smart Search**: Search through note titles, content, transcriptions, and tags
- **User Authentication**: Secure login and signup system

### Advanced Features
- **Note Categorization**: Organize notes by categories (General, Work, Personal, Study, Ideas)
- **Tagging System**: Add custom tags to notes for better organization
- **Note Sharing**: Share notes with other users
- **Export Functionality**: Export notes as PDF files
- **Analytics Dashboard**: Track your note-taking activity with statistics
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone or download the project**
   ```bash
   cd AuraNote
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
AuraNote/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── search.html
│   └── edit_note.html
├── static/              # Static assets
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
└── uploads/             # File upload directory (created automatically)
```

## 🎯 How to Use

### Getting Started
1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Access your account with your credentials
3. **Dashboard**: View your notes and analytics

### Creating Notes
1. Click "Create New Note" button
2. Choose note type:
   - **Text Note**: Type directly in the content area
   - **File Upload**: Upload a .txt file
   - **Audio Note**: Upload audio files (.mp3, .wav, .m4a) for transcription
3. Add title, category, and tags
4. Save your note

### Searching Notes
- Use the search bar to find notes by content, title, or tags
- Filter by category for more specific results
- Audio notes are searchable through their transcriptions

### Managing Notes
- **Edit**: Click the edit button to modify note content
- **Export**: Download notes as PDF files
- **Delete**: Remove notes you no longer need
- **Share**: Share notes with other users

## 🔧 Technical Details

### Backend Technologies
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **Flask-Login**: User session management
- **Werkzeug**: Security utilities
- **Speech Recognition**: Audio transcription
- **ReportLab**: PDF generation

### Frontend Technologies
- **Bootstrap 5**: CSS framework
- **Font Awesome**: Icons
- **Custom CSS**: Modern styling with gradients and animations
- **Vanilla JavaScript**: Interactive functionality

### Database
- **SQLite**: Lightweight database (auranotes.db)
- **Tables**: Users, Notes with relationships

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradients and animations
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Elegant color scheme
- **Smooth Animations**: Hover effects and transitions
- **Intuitive Navigation**: Easy-to-use interface

## 🔒 Security Features

- **Password Hashing**: Secure password storage using Werkzeug
- **Session Management**: Secure user sessions
- **File Upload Validation**: Safe file handling
- **User Isolation**: Users can only access their own notes

## 📊 Analytics Dashboard

Track your productivity with:
- Total notes count
- Notes by type (Text, File, Audio)
- Creation trends
- Category distribution

## 🎵 Audio Transcription

AuraNotes uses Google's Speech Recognition API to convert audio files to text:
- Supports multiple audio formats
- Automatic transcription on upload
- Searchable transcriptions
- Error handling for unsupported formats

## 🚀 Future Enhancements

Potential features for future versions:
- Real-time collaboration
- Mobile app
- Cloud synchronization
- Advanced search filters
- Note templates
- Voice commands
- Integration with external services

## 🐛 Troubleshooting

### Common Issues

1. **Audio transcription not working**
   - Ensure you have an internet connection
   - Check audio file format (supports .mp3, .wav, .m4a)
   - Verify audio file is not corrupted

2. **File upload issues**
   - Check file size (max 16MB)
   - Ensure file format is supported
   - Check uploads directory permissions

3. **Database errors**
   - Delete auranotes.db to reset database
   - Restart the application

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For support or questions, please open an issue in the project repository.

---

**Made with ❤️ for better note-taking**
