// Star Rating System
const starRating = document.getElementById('star-rating');
const ratingValue = document.getElementById('rating-value');
const ratingText = document.getElementById('rating-text');

if (starRating) {
    const stars = starRating.querySelectorAll('i');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        // Hover effect
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });

        // Click to select
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            ratingValue.value = selectedRating;
            updateRatingText(selectedRating);
            highlightStars(selectedRating);
        });
    });

    // Reset on mouse leave if no rating selected
    starRating.addEventListener('mouseleave', () => {
        if (selectedRating > 0) {
            highlightStars(selectedRating);
        } else {
            highlightStars(0);
        }
    });

    function highlightStars(count) {
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }

    function updateRatingText(rating) {
        const texts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        ratingText.textContent = texts[rating] || 'Click to rate';
        ratingText.style.color = '#f5c518';
    }
}

// Character Counter
const reviewMessage = document.getElementById('review-message');
const charCount = document.getElementById('char-count');

if (reviewMessage && charCount) {
    reviewMessage.addEventListener('input', () => {
        const length = reviewMessage.value.length;
        charCount.textContent = length;
        
        if (length > 500) {
            reviewMessage.value = reviewMessage.value.substring(0, 500);
            charCount.textContent = 500;
        }
        
        if (length > 450) {
            charCount.style.color = '#ff6b6b';
        } else {
            charCount.style.color = '#f5c518';
        }
    });
}

// Review Form Submission
const reviewForm = document.getElementById('review-form');
const reviewMessageDisplay = document.getElementById('review-message-display');

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('reviewer-name').value.trim();
        const email = document.getElementById('reviewer-email').value.trim();
        const eventType = document.getElementById('event-type-review').value;
        const eventDate = document.getElementById('event-date-review').value;
        const rating = ratingValue.value;
        const title = document.getElementById('review-title').value.trim();
        const message = reviewMessage.value.trim();
        const consent = document.getElementById('display-consent').checked;

        // Validation
        if (!name || name.length < 2) {
            showReviewMessage('Please enter a valid name.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showReviewMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (!eventType) {
            showReviewMessage('Please select an event type.', 'error');
            return;
        }

        if (!rating) {
            showReviewMessage('Please select a rating.', 'error');
            return;
        }

        if (!title || title.length < 5) {
            showReviewMessage('Please enter a review title (at least 5 characters).', 'error');
            return;
        }

        if (!message || message.length < 20) {
            showReviewMessage('Please write a review (at least 20 characters).', 'error');
            return;
        }

        if (!consent) {
            showReviewMessage('Please consent to display your review.', 'error');
            return;
        }

        // Create review object
        const review = {
            name,
            email,
            eventType,
            eventDate,
            rating: parseInt(rating),
            title,
            message,
            consent,
            submittedAt: new Date().toISOString()
        };

        // Save to localStorage
        saveReview(review);

        // Show success message
        showReviewMessage('Thank you for your review! Your feedback has been submitted successfully and will be reviewed by our team.', 'success');

        // Reset form
        reviewForm.reset();
        ratingValue.value = '';
        ratingText.textContent = 'Click to rate';
        ratingText.style.color = '#d3d3d3';
        const stars = starRating.querySelectorAll('i');
        stars.forEach(star => {
            star.classList.remove('fas');
            star.classList.add('far');
        });
        charCount.textContent = '0';

        // Scroll to message
        reviewMessageDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showReviewMessage(message, type) {
    reviewMessageDisplay.textContent = message;
    reviewMessageDisplay.className = `review-message ${type}`;
    reviewMessageDisplay.style.display = 'block';
    
    setTimeout(() => {
        if (type === 'success') {
            reviewMessageDisplay.style.display = 'none';
        }
    }, 8000);
}

function saveReview(review) {
    // Get existing reviews from localStorage
    let reviews = JSON.parse(localStorage.getItem('eventraReviews')) || [];
    
    // Add new review
    reviews.unshift(review);
    
    // Keep only last 50 reviews
    if (reviews.length > 50) {
        reviews = reviews.slice(0, 50);
    }
    
    // Save back to localStorage
    localStorage.setItem('eventraReviews', JSON.stringify(reviews));
    
    // Update recent reviews display
    displayRecentReviews();
}

function displayRecentReviews() {
    const recentReviewsList = document.getElementById('recent-reviews-list');
    if (!recentReviewsList) return;

    const reviews = JSON.parse(localStorage.getItem('eventraReviews')) || [];
    
    if (reviews.length === 0) return;

    // Clear existing reviews except the default ones
    // We'll prepend new reviews to the existing ones
    
    // Create HTML for new reviews (show only first 3 new ones)
    const newReviewsHTML = reviews.slice(0, 3).map(review => {
        const starsHTML = generateStarsHTML(review.rating);
        const timeAgo = getTimeAgo(review.submittedAt);
        const eventTypeLabel = getEventTypeLabel(review.eventType);
        
        return `
            <div class="review-card new-review">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <h4>${escapeHTML(review.name)}</h4>
                            <span class="review-date">${eventTypeLabel} - ${timeAgo}</span>
                        </div>
                    </div>
                    <div class="review-stars">
                        ${starsHTML}
                    </div>
                </div>
                <h5>${escapeHTML(review.title)}</h5>
                <p>${escapeHTML(review.message)}</p>
            </div>
        `;
    }).join('');

    // Prepend new reviews
    if (newReviewsHTML) {
        recentReviewsList.insertAdjacentHTML('afterbegin', newReviewsHTML);
    }
}

function generateStarsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            html += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 === rating) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
}

function getEventTypeLabel(eventType) {
    const labels = {
        'wedding': 'Wedding',
        'destination-wedding': 'Destination Wedding',
        'birthday': 'Birthday Party',
        'private': 'Private Party',
        'corporate': 'Corporate Event',
        'other': 'Event'
    };
    return labels[eventType] || 'Event';
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load recent reviews on page load
document.addEventListener('DOMContentLoaded', () => {
    displayRecentReviews();
});
