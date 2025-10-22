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

// Global functions
function toggleFileInput() {
    const noteType = document.getElementById('note_type').value;
    const fileInputGroup = document.getElementById('file-input-group');
    const contentTextarea = document.getElementById('content');
    const ffmpegWarning = document.getElementById('ffmpeg-warning');
    
    if (noteType === 'file' || noteType === 'audio') {
        fileInputGroup.style.display = 'block';
        if (noteType === 'audio') {
            contentTextarea.placeholder = 'Audio transcription will be added automatically...';
            ffmpegWarning.style.display = 'block';
        } else {
            ffmpegWarning.style.display = 'none';
        }
    } else {
        fileInputGroup.style.display = 'none';
        contentTextarea.placeholder = 'Write your note content here...';
        ffmpegWarning.style.display = 'none';
    }
}

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
