(The file `c:\Users\si258\OneDrive\Documents\GitHub\Hackathon-2025\README.MD` exists, but is empty)
**University Life Assistant**

Improve and simplify a student's university life by connecting authentication, course selections, and module-based chat channels.

**Project Summary**: University Email-based OTP authentication; students select courses and modules, are automatically added to module chats (public and private), and can access public channels and club-private channels. The system should include university selection and an optional chatbot for simple campus tasks (e.g., booking a badminton pitch at Roger Battlies).

**Problem**: Students struggle with fragmented communications, manual group management, and limited campus-service discovery.

**Solution**: A unified platform that:
- **Auth**: Uses university email + OTP to verify students quickly and securely.
- **Course & Module Selection**: Lets students choose courses and modules during onboarding.
- **Auto Grouping**: Automatically adds students to module-specific chat channels based on their selections.
- **Chats**: Provides public module channels (open to all students) and private club channels (invite-only).

**Features (Current)**
- **Email OTP Authentication**: Verify accounts using university email OTP.
- **Courses & Modules Selection**: Friendly UI to pick courses and modules at signup or from profile settings.
- **Automatic Addition to Module Chats**: Students are subscribed to chats for modules they join.
- **Module-based Chats**: Channels organized per module, making announcements and discussions easy to find.
- **Public Channels**: Every student can access public channels for modules and general university info.
- **Private Club Channels**: Clubs and organizations can create private, invite-only channels.

**Features to Implement / Prioritize**
- **University Selection**: Allow students to select their university from a list during signup (drives domain-based email verification and campus-specific data).
- **Chatbot (Optional)**: A lightweight assistant to answer common questions and perform simple tasks — e.g., "How do I book a badminton pitch at Roger Battlies?"

**Walkthrough / UX Flow**
1. Student signs up and chooses their university.
2. Student enters university email; system sends OTP to the email address.
3. After entering the OTP, the account is verified.
4. Student selects courses and modules (or imports them from an institutional API if available).
5. System automatically subscribes the student to module chat channels.
6. Student can access public channels and request access or invites to private club channels.
7. (Optional) Student interacts with a chatbot for quick info or simple campus actions.

**Implementation Notes**
- **Auth**: Email OTP flow — generate time-limited OTP, send via SMTP or university mail API, verify on submit.
- **University Selection**: Maintain a mapping of university metadata (domain patterns, display name, optional API endpoints).
- **Module Chat Management**: Create channels per module; on enrollment add the student to the channel membership list; use roles for club admins/moderators.
- **Chat Types**: Public channels are readable/writable by students in the module; private channels require an invite or admin approval.
- **Chatbot**: Can be a rule-based assistant for the first iteration (FAQ + command handlers). Optionally integrate an LLM for richer interactions later.

**Suggested Tech Stack**
- **Backend**: Node.js/Express or Python/Flask/FastAPI for quick prototyping.
- **Database**: PostgreSQL for relational data (users, modules, enrollments), Redis for sessions/OTP caching.
- **Auth / Messaging**: Use WebSocket (Socket.IO) or a managed chat service for real-time chat.
- **Mail**: SMTP or university mail API to send OTPs.
- **Frontend**: React/Vue with a simple UI for course selection and chat.

**Roadmap & Next Steps**
- Implement university selection and domain-based OTP sending.
- Build the OTP verification flow and user onboarding screens.
- Implement course/module selection UI and backend endpoints.
- Create module channel creation and auto-enrollment logic.
- Add basic public/private chat functionality.
- Prototype a rule-based chatbot for common campus tasks (booking sports, finding campus locations).

**How You Can Help / Contribute**
- Implement the OTP email sender and verification endpoints.
- Build the course/module selection UI and API integration.
- Create chat channel management and auto-enrollment logic.
- Prototype the chatbot (start with a simple FAQ and action handlers).

**Contact / Maintainers**
- Repo owner: Abhiram2144

**License**
- Add a license file if you want this project to be open source. CC0 / MIT are common choices.

---


