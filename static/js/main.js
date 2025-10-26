// AuraNotes JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Search functionality enhancements
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) {
        // Add search suggestions (placeholder for future enhancement)
        searchInput.addEventListener('input', function() {
            const query = this.value;
            if (query.length > 2) {
                // Future: Add real-time search suggestions
                console.log('Searching for:', query);
            }
        });
    }

    // File upload preview
    const fileInput = document.getElementById('file');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                const fileType = file.type;
                
                // Show file info
                let fileInfo = document.getElementById('file-info');
                if (!fileInfo) {
                    fileInfo = document.createElement('div');
                    fileInfo.id = 'file-info';
                    fileInfo.className = 'mt-2 p-2 bg-light rounded';
                    this.parentNode.appendChild(fileInfo);
                }
                
                fileInfo.innerHTML = `
                    <small class="text-muted">
                        <i class="fas fa-file"></i> 
                        ${file.name} (${fileSize} MB)
                        <br>
                        Type: ${fileType}
                    </small>
                `;

                // Validate file type based on note type
                const noteType = document.getElementById('note_type').value;
                if (noteType === 'audio') {
                    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
                    if (!audioTypes.includes(fileType)) {
                        fileInfo.innerHTML += '<br><small class="text-danger">Warning: This may not be a valid audio file</small>';
                    }
                } else if (noteType === 'file') {
                    if (fileType !== 'text/plain') {
                        fileInfo.innerHTML += '<br><small class="text-warning">Note: Only .txt files are recommended for text file uploads</small>';
                    }
                }
            }
        });
    }

    // Note type change handler
    const noteTypeSelect = document.getElementById('note_type');
    if (noteTypeSelect) {
        noteTypeSelect.addEventListener('change', function() {
            toggleFileInput();
        });
        // Ensure correct UI state on initial load
        try { toggleFileInput(); } catch (e) { /* ignore */ }
    }

    // Character counter for textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        if (maxLength) {
            const counter = document.createElement('div');
            counter.className = 'text-muted small mt-1';
            counter.style.textAlign = 'right';
            textarea.parentNode.appendChild(counter);
            
            function updateCounter() {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${remaining} characters remaining`;
                if (remaining < 50) {
                    counter.className = 'text-danger small mt-1';
                } else if (remaining < 100) {
                    counter.className = 'text-warning small mt-1';
                } else {
                    counter.className = 'text-muted small mt-1';
                }
            }
            
            textarea.addEventListener('input', updateCounter);
            updateCounter();
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            const fileInput = form.querySelector('input[type="file"]');
            
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                
                // Check if it's an audio file upload
                if (fileInput && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const isAudio = file.type.startsWith('audio/');
                    
                    if (isAudio) {
                        submitBtn.innerHTML = '<i class="fas fa-microphone"></i> Transcribing Audio...';
                        submitBtn.disabled = true;
                        
                        // Show progress message
                        const progressMsg = document.createElement('div');
                        progressMsg.className = 'alert alert-info mt-2';
                        progressMsg.innerHTML = '<i class="fas fa-info-circle"></i> Audio transcription may take 30-60 seconds. Please wait...';
                        form.appendChild(progressMsg);
                        
                        // Re-enable after 2 minutes as fallback
                        setTimeout(() => {
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                            if (progressMsg.parentNode) {
                                progressMsg.remove();
                            }
                        }, 120000);
                    } else {
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                        submitBtn.disabled = true;
                        
                        // Re-enable after 10 seconds as fallback
                        setTimeout(() => {
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                        }, 10000);
                    }
                } else {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    submitBtn.disabled = true;
                    
                    // Re-enable after 10 seconds as fallback
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 10000);
                }
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[name="q"]');
            if (searchInput) {
                searchInput.focus();
            } else {
                window.location.href = '/search';
            }
        }
        
        // Ctrl/Cmd + N for new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const createBtn = document.querySelector('[data-bs-target="#createNoteModal"]');
            if (createBtn) {
                createBtn.click();
            }
        }
    });

    // Add keyboard shortcut hints
    const searchInputs = document.querySelectorAll('input[name="q"]');
    searchInputs.forEach(input => {
        input.placeholder = input.placeholder + ' (Ctrl+K)';
    });

    // Auto-save draft functionality (localStorage)
    const contentTextarea = document.getElementById('content');
    if (contentTextarea) {
        // Load saved draft
        const savedDraft = localStorage.getItem('noteDraft');
        if (savedDraft && !contentTextarea.value) {
            contentTextarea.value = savedDraft;
        }

        // Save draft on input
        contentTextarea.addEventListener('input', function() {
            localStorage.setItem('noteDraft', this.value);
        });

        // Clear draft on successful form submission
        const form = contentTextarea.closest('form');
        if (form) {
            form.addEventListener('submit', function() {
                localStorage.removeItem('noteDraft');
            });
        }
    }

    // Enhanced note card interactions
    const noteCards = document.querySelectorAll('.note-card');
    noteCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Copy to clipboard functionality
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(function() {
            // Show success message
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 2000);
        });
    };

    // Add copy buttons to transcription content
    const transcriptionElements = document.querySelectorAll('.transcription-text');
    transcriptionElements.forEach(element => {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-sm btn-outline-secondary ms-2';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy transcription';
        copyBtn.onclick = () => copyToClipboard(element.textContent);
        
        const parent = element.parentNode;
        if (parent.querySelector('.transcription-content')) {
            parent.querySelector('.transcription-content').appendChild(copyBtn);
        }
    });
});

// Voice recording functionality
let mediaRecorder;
let audioChunks = [];
let recordingTimer;
let startTime;
let pauseStartTime;
let totalPausedTime = 0;
let volumeAnalyser;
let volumeDataArray;
let animationFrame;
const MAX_RECORDING_DURATION = 5 * 60; // 5 minutes in seconds

async function initializeRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        
        // Set up analyser for volume meter
        volumeAnalyser = audioContext.createAnalyser();
        volumeAnalyser.fftSize = 256;
        source.connect(volumeAnalyser);
        volumeDataArray = new Uint8Array(volumeAnalyser.frequencyBinCount);
        
    mediaRecorder = new MediaRecorder(stream);
    // keep references for cleanup
    mediaRecorder._audioContext = audioContext;
    mediaRecorder._stream = stream;
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onpause = () => {
            pauseStartTime = Date.now();
            document.getElementById('pauseButton').innerHTML = '<i class="fas fa-play"></i> Resume';
            document.querySelector('.volume-meter-container').classList.remove('recording');
        };
        
        mediaRecorder.onresume = () => {
            totalPausedTime += Date.now() - pauseStartTime;
            document.getElementById('pauseButton').innerHTML = '<i class="fas fa-pause"></i> Pause';
            document.querySelector('.volume-meter-container').classList.add('recording');
        };
        
        mediaRecorder.onstop = () => {
            try {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = document.getElementById('recordedAudio');
                if (audio) audio.src = audioUrl;
                const preview = document.getElementById('audioPreview');
                if (preview) preview.style.display = 'block';

                // Add the recorded audio to the file input
                const file = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
                const container = new DataTransfer();
                container.items.add(file);
                const fileInputEl = document.getElementById('file');
                if (fileInputEl) fileInputEl.files = container.files;

                // Clean up
                cancelAnimationFrame(animationFrame);
                const volCont = document.querySelector('.volume-meter-container');
                if (volCont) volCont.style.display = 'none';
                if (mediaRecorder && mediaRecorder._audioContext) {
                    try { mediaRecorder._audioContext.close(); } catch (e) { /* ignore */ }
                }
            } finally {
                // mark recorder as gone so we re-initialize next time
                mediaRecorder = null;
            }
        };

        mediaRecorder.onerror = (ev) => {
            console.error('MediaRecorder error', ev);
            // Reset UI and allow re-init
            const recordBtn = document.getElementById('recordButton');
            const pauseBtn = document.getElementById('pauseButton');
            const stopBtn = document.getElementById('stopButton');
            const volCont = document.querySelector('.volume-meter-container');
            if (recordBtn) recordBtn.style.display = 'inline-block';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (stopBtn) stopBtn.style.display = 'none';
            if (volCont) volCont.style.display = 'none';
            try { if (mediaRecorder && mediaRecorder._stream) mediaRecorder._stream.getTracks().forEach(t=>t.stop()); } catch(e){}
            try { if (mediaRecorder && mediaRecorder._audioContext) mediaRecorder._audioContext.close(); } catch(e){}
            mediaRecorder = null;
        };
        
        return true;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please ensure you have granted microphone permissions.');
        return false;
    }
}

function updateVolumeMeter() {
    volumeAnalyser.getByteFrequencyData(volumeDataArray);
    const average = volumeDataArray.reduce((acc, val) => acc + val, 0) / volumeDataArray.length;
    const volume = Math.min(100, average * 1.5); // Scale up for better visual feedback
    document.getElementById('volumeBar').style.width = volume + '%';
    animationFrame = requestAnimationFrame(updateVolumeMeter);
}

function updateRecordingTime() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime - totalPausedTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('recordingTime').textContent = `${minutes}:${seconds}`;
    
    // Update progress bar
    const progress = (elapsed / MAX_RECORDING_DURATION) * 100;
    document.getElementById('durationProgress').style.width = progress + '%';
    
    // Auto-stop if max duration reached
    if (elapsed >= MAX_RECORDING_DURATION) {
        stopRecording();
        alert('Maximum recording duration (5 minutes) reached.');
    }
}

function startRecording() {
    audioChunks = [];
    totalPausedTime = 0;
    try {
        mediaRecorder.start(1000); // Collect data every second
    } catch (err) {
        // if start fails, try to re-initialize and start again
        console.warn('startRecording failed, re-initializing recorder', err);
        mediaRecorder = null;
        initializeRecorder().then(initialized => {
            if (initialized && mediaRecorder) {
                try { mediaRecorder.start(1000); } catch(e) { console.error('Failed to start after re-init', e); }
            }
        });
        return;
    }
    startTime = Date.now();
    
    // Update UI
    document.getElementById('recordButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'inline-block';
    document.getElementById('stopButton').style.display = 'inline-block';
    document.getElementById('recordingTime').style.display = 'inline-block';
    document.querySelector('.volume-meter-container').style.display = 'block';
    document.querySelector('.volume-meter-container').classList.add('recording');
    
    // Start timers
    recordingTimer = setInterval(updateRecordingTime, 1000);
    updateVolumeMeter();
}

function pauseRecording() {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        clearInterval(recordingTimer);
    } else if (mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        recordingTimer = setInterval(updateRecordingTime, 1000);
    }
}

function stopRecording() {
    try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    } catch (e) { console.warn('stopRecording error', e); }
    clearInterval(recordingTimer);
    
    // Update UI
    document.getElementById('recordButton').style.display = 'inline-block';
    document.getElementById('pauseButton').style.display = 'none';
    document.getElementById('stopButton').style.display = 'none';
    document.getElementById('recordingTime').style.display = 'none';
    document.getElementById('durationProgress').style.width = '0%';
    
    // Stop all audio tracks
    try {
        if (mediaRecorder && mediaRecorder._stream) mediaRecorder._stream.getTracks().forEach(track => track.stop());
    } catch (e) { /* ignore */ }
    // ensure mediaRecorder is cleared (onstop will also clear it)
    // mediaRecorder = null;
}

// Global functions
function toggleFileInput() {
    const noteType = document.getElementById('note_type').value;
    const fileInputGroup = document.getElementById('file-input-group');
    const contentTextarea = document.getElementById('content');
    const ffmpegWarning = document.getElementById('ffmpeg-warning');
    const voiceRecorder = document.getElementById('voice-recorder');
    
    if (noteType === 'file' || noteType === 'audio') {
        fileInputGroup.style.display = 'block';
        if (noteType === 'audio') {
            contentTextarea.placeholder = 'Audio transcription will be added automatically...';
            ffmpegWarning.style.display = 'block';
            voiceRecorder.style.display = 'block';
            
            // Initialize voice recorder
            const recordButton = document.getElementById('recordButton');
            const pauseButton = document.getElementById('pauseButton');
            const stopButton = document.getElementById('stopButton');
            const saveButton = document.getElementById('saveRecording');
            const discardButton = document.getElementById('discardRecording');

            // Reset recorder UI to a known good state so record button is always visible
            try {
                if (recordButton) recordButton.style.display = 'inline-block';
                if (pauseButton) pauseButton.style.display = 'none';
                if (stopButton) stopButton.style.display = 'none';
                const recTime = document.getElementById('recordingTime');
                if (recTime) recTime.style.display = 'none';
                const prog = document.getElementById('durationProgress');
                if (prog) prog.style.width = '0%';
                const volCont = document.querySelector('.volume-meter-container');
                if (volCont) {
                    volCont.style.display = 'none';
                    volCont.classList.remove('recording');
                }
            } catch (e) { /* ignore */ }

            // Attach handlers only if elements exist to avoid JS errors
            if (recordButton) {
                recordButton.onclick = async () => {
                    if (!mediaRecorder) {
                        const initialized = await initializeRecorder();
                        if (initialized) {
                            startRecording();
                        }
                    } else {
                        startRecording();
                    }
                };
            }

            if (pauseButton) {
                pauseButton.onclick = () => {
                    pauseRecording();
                };
            }

            if (stopButton) {
                stopButton.onclick = () => {
                    stopRecording();
                };
            }

            if (discardButton) {
                discardButton.onclick = () => {
                    document.getElementById('audioPreview').style.display = 'none';
                    const fileInputEl = document.getElementById('file');
                    if (fileInputEl) fileInputEl.value = '';
                    audioChunks = [];
                    // Reset progress bar
                    const prog = document.getElementById('durationProgress');
                    if (prog) prog.style.width = '0%';
                    // Ensure record button visible after discard
                    const recordBtn = document.getElementById('recordButton');
                    const pauseBtn = document.getElementById('pauseButton');
                    const stopBtn = document.getElementById('stopButton');
                    if (recordBtn) recordBtn.style.display = 'inline-block';
                    if (pauseBtn) pauseBtn.style.display = 'none';
                    if (stopBtn) stopBtn.style.display = 'none';
                };
            }
            
        } else {
            voiceRecorder.style.display = 'none';
            ffmpegWarning.style.display = 'none';
        }
    } else {
        fileInputGroup.style.display = 'none';
        voiceRecorder.style.display = 'none';
        contentTextarea.placeholder = 'Write your note content here...';
        ffmpegWarning.style.display = 'none';
    }
}

// Ensure recorder state updates when the modal is opened (Bootstrap modal event)
document.addEventListener('DOMContentLoaded', function() {
    try {
        const createModalEl = document.getElementById('createNoteModal');
        if (createModalEl) {
            createModalEl.addEventListener('show.bs.modal', function () {
                try { toggleFileInput(); } catch (e) { /* ignore */ }
            });
            // also ensure cleanup when modal is hidden
            createModalEl.addEventListener('hidden.bs.modal', function () {
                try {
                    // if a recording is in progress, stop and cleanup
                    if (mediaRecorder && mediaRecorder.state && mediaRecorder.state !== 'inactive') {
                        try { mediaRecorder.stop(); } catch(e) { /* ignore */ }
                    }
                    if (mediaRecorder && mediaRecorder._stream) {
                        try { mediaRecorder._stream.getTracks().forEach(t=>t.stop()); } catch(e){}
                    }
                    if (mediaRecorder && mediaRecorder._audioContext) {
                        try { mediaRecorder._audioContext.close(); } catch(e){}
                    }
                } catch (e) {
                    console.warn('Error during modal hidden cleanup', e);
                } finally {
                    mediaRecorder = null;
                    audioChunks = [];
                    clearInterval(recordingTimer);
                    cancelAnimationFrame(animationFrame);
                    const volCont = document.querySelector('.volume-meter-container');
                    if (volCont) volCont.style.display = 'none';
                    const recordBtn = document.getElementById('recordButton');
                    const pauseBtn = document.getElementById('pauseButton');
                    const stopBtn = document.getElementById('stopButton');
                    if (recordBtn) recordBtn.style.display = 'inline-block';
                    if (pauseBtn) pauseBtn.style.display = 'none';
                    if (stopBtn) stopBtn.style.display = 'none';
                }
            });
        }
    } catch (e) {
        // if bootstrap events are not available, silently ignore
    }
});

// Toast notification styles
const toastStyles = `
    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Inject toast styles
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);
