# Kurdish POS System (Kurdrahab)

## Overview
A Kurdish-language Point of Sale (POS) system for retail stores. This is a static web application built with vanilla HTML, CSS, and JavaScript. The system features:
- Product management with categories
- Shopping cart functionality
- Receipt generation and PDF download
- Kurdish numeral and date formatting
- LocalStorage for data persistence

## Project Structure
- `index.html` - Main application page
- `script.js` - Application logic and functionality
- `style.css` - Styling with RTL support for Kurdish language
- `README.md` - Project documentation

## Technology Stack
- Pure HTML5, CSS3, and JavaScript (no build tools required)
- jsPDF library (loaded via CDN) for PDF receipt generation
- LocalStorage for client-side data persistence

## Features
- Add/manage products with categories (خواردەمەنی, خواردنەوە, پاکیژەیی, کەلووپەل)
- Shopping cart with quantity controls
- Checkout with payment method selection (cash/card)
- Receipt generation with print and PDF download
- Real-time Kurdish date and time display
- Stock tracking and low-stock warnings

## Recent Changes
- Added fixed action buttons at the bottom (New Sale, Add Product, Quick Checkout) - November 10, 2025
- Fixed PDF receipt to display all text in Kurdish Central (Sorani) using Latin script - November 10, 2025
- Installed Python 3.11 for the development server - November 10, 2025
- Initial import and Replit setup (November 9, 2025)
