# FinalDraft

## A Comprehensive Assignment Management System

FinalDraft is a modern web-based platform designed to streamline assignment workflows with support for multiple submissions, subtask-based reviews, and clear collaboration features.

## Team Members

- **Jai Bhadu** (23114039) - Core backend development, authentication system, chat backend implementation, frontend for chat functionality, frontend API services, database design
- **Anmol Goklani** (23114007) - Backend development for assignments, submissions, groups, and other data models, database design and optimization
- **Madhav Deorah** (23114059) - UI/UX design in Figma, presentation design, creation of frontend modules
- **Nitin Raj** (23114075) - Frontend development for assignment interfaces, dashboards, and UI components

## Project Overview

FinalDraft addresses inefficiencies in traditional assignment workflows by offering a streamlined, web-based system that supports:

- **Multiple submissions** for iterative feedback and improvement
- **Subtask-based reviews** for granular feedback
- **Group-based management** for assigning work to classes or specific teams
- **Real-time communication** between reviewers and reviewees

## Key Features

- **Multi-Iteration Submissions**: Students can submit work multiple times for each subtask, allowing for focused feedback and revision
- **Subtask-Level Division**: Assignments can be split into subtasks with individual submission and review cycles
- **Role-Based Dashboards**: Different views and capabilities for reviewers, reviewees, and admins
- **Tagging Reviewers**: Students can tag specific reviewers while submitting to direct their queries
- **Group-Based Assignment Management**: Assignments can be assigned to groups, individuals, or teams
- **Status Tracking**: Real-time visibility into each member's submission status (Pending, In Iteration, or Completed)
- **Centralized Submission History**: Every submission and version is logged and viewable in one place

## Technology Stack

### Frontend
- React.js with Material-UI
- TypeScript
- React Router for navigation
- Axios for API communication
- Context API for state management

### Backend
- Django with Django REST Framework
- Django Channels for WebSocket support
- PostgreSQL database
- OAuth integration (Google and institutional)

### Development Tools
- Git & GitHub for version control
- Figma for UI prototyping

## System Architecture

### Frontend Architecture
- **UI Components**: Modular components organized by functionality
- **State Management**: Using Context API and local storage
- **Services**: API, Auth, and WebSocket services

### Backend Architecture
- **API Layer**: REST APIs using Django REST Framework
- **Core Services**: Assignment, Submission, Review, and Email services
- **Database Models**: User, Assignment, Subtask, Submission, ChatRoom, etc.

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- PostgreSQL

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-repo/finaldraft.git
cd finaldraft/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
python manage.py migrate

# Start the server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Application Domains

- University classrooms for assignment management
- Online learning platforms
- MOOCs (Massive Open Online Courses)
- Internal training programs in corporations
- Peer-reviewed learning programs
- Student clubs for training new recruits

## Future Enhancements

- AI-generated feedback suggestions
- Predictive analytics to identify at-risk students
- Git-like iteration and versioning system
- Enhanced progress tracking dashboards
- Improved in-app notifications alongside email alerts

## License

[MIT License](LICENSE)

## Contact

For questions or feedback, please contact team members:
- Jai Bhadu - jbsss785@gmail.com
- Anmol Goklani - anmolgoklani24@gmail.com
- Madhav Deorah - madhav_d@cs.iitr.ac.in
- Nitin Raj - rajnitin088@gmail.com
