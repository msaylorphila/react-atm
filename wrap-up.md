## Questions

### What issues, if any, did you find with the existing code?
* The initial UI lacked client side validation, forcing the frontend to make round trips to the server for basic input checks, delaying user feedback.
* Authentication consisted of solely a raw account number with no password, token, or session verification.
* The frontend relied on a hardcoded API URL which limited deployment capability.
* Credit accounts lacked proper guards around missing or null limit states. 
* There was no row level or explicit transaction isolation, providing room for concurrency risks.
* The application lacks proper currency formatting.

### What issues, if any, did you find with the request to add functionality?
* The initial challenge documentation and database schema lacked a clear specification on whether credit limits were mandatory for credit accounts, or if null/unconstrained limits were permitted. Resolving this meant implementing a guard to fail if nulls were found to protect financial data integrity.
* The requirement specified a daily withdrawal cap, but left open how a day should be calculated. Specifically, I was unsure whether a day meant a 24 hour window from the user's last transaction or a calendar day reset at midnight. I resolved this by implementing a calendar day reset boundary to the users timezone using `CURRENT_DATE::timestamptz`.
* The challenge frequently interchanged 'Account' and 'Customer', but the underlying data model has no distinct customer entity. For this reason, I structured the request around individual account records rather than customer profiles.

### Would you modify the structure of this project if you were to start it over? If so, how?
I would not necessarily recreate the entire structure. If this were something meant to be maintained in production, I would look towards strengthening it by: 
- Removing environment variable files from version control
- Refactoring raw handlers that contain mixed queries and business logic into dedicated services and repositories to separate business rules from data access
- Similarly introduce a client service layer to keep components clean
- Ensuring reusable logic is accessible by other components 
- Continue strengthening the freshly created test suite

### Were there any pieces of this project that you were not able to complete that you'd like to mention?
The core database setup, transactional safety guarantees, bug fixes, and critical service logic are fully implemented. Testing coverage and end to end user flows can always be expanded, but the current suite successfully covers core transaction handlers and validation logic.

### If you were to continue building this out, what would you like to add next?
- Implement JWT based authentication or secure cookie sessions linked to user accounts.
- Add request validation middleware on all API routes
- Build an audit logging table to track all transactions, failed validation attempts, and user actions for compliance and debugging
- Extract the transaction limits configs into one shared space the client and server can both access

### If you have any other comments or info you'd like the reviewers to know, please add them below.
Thank you for your time reviewing this challenge. I appreciated the subtle nuances of solutioning this. 

I chose to provide a dual validation strategy. Business rule validation lives on the frontend to provide instant feedback and protect server resources from unnecessary round trips, while authoritative validation on the backend ensures the server and database are fully protected against direct API calls or bypassed clients.