
# Email-X

Email-X is a web application designed for Easy Email Classifications. The application provides the following functionality:

- **User Authentication**: Users can log in using Google OAuth.
- **OpenAI Key Management**: Users can input their OpenAI key, which is saved in localStorage for subsequent use.
- **Email Fetching**: Fetch the user's last X emails from Gmail using the Gmail API.
- **Email Classification**: Utilize OpenAI GPT-4o to classify emails into categories such as Important, Promotional, Social, Marketing, Spam, and General.
- **Local Storage**: Store fetched emails in the user's local storage for quick access and reduced API calls.
- **Responsive Design**: Built with Next.js and styled using Tailwind CSS for a responsive and user-friendly interface.

This project demonstrates skills in integrating multiple APIs, managing authentication, and creating a clean, functional user interface.

# Projects Screenshots 


https://github.com/Divyanshu11011/emailx/assets/93030810/4e3b3af4-b42a-42f2-b0b6-fb5e9e93658f



![image](https://github.com/Divyanshu11011/emailx/assets/93030810/b99a67bc-db0b-4045-b1f3-7a2df1bb55b7)

![image](https://github.com/Divyanshu11011/emailx/assets/93030810/e83084d9-8c09-4ad7-9c4e-18d6bb1c47ce)

![image](https://github.com/Divyanshu11011/emailx/assets/93030810/62794525-d6ab-4cbd-969a-f56e3f742e7b)

![image](https://github.com/Divyanshu11011/emailx/assets/93030810/9e279943-1560-493a-918d-e41f596009fe)




## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)

## Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/Divyanshu11011/emailx.git
    cd emailx
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

## Configuration

Before running the project, you need to set up the environment variables.

1. **Create a `.env` file in the root directory:**

    ```sh
    touch .env
    ```

## Generating Environment Variables

To run the project, you need to set up several environment variables. Follow these steps to generate them:

### GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

1. **Go to the Google Cloud Console**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Create a new project or select an existing project**.
3. **Enable the necessary APIs**:
   - Navigate to `APIs & Services` > `Library`.
   - Enable `Google People API` and `Gmail API`.
4. **Create OAuth 2.0 credentials**:
   - Navigate to `APIs & Services` > `Credentials`.
   - Click on `Create Credentials` and select `OAuth 2.0 Client IDs`.
   - Configure the consent screen if prompted.
   - Set the application type to `Web application`.
   - Add `http://localhost:3000/api/auth/callback/google` to the `Authorized redirect URIs`.
   - Click `Create`.

After creating the credentials, you will receive a `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add these to your `.env` file.

### NEXTAUTH_URL and GOOGLE_REDIRECT_URI

Set the `NEXTAUTH_URL` and `GOOGLE_REDIRECT_URI` to the local URLs for your development environment:

```
NEXTAUTH_URL=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### NEXTAUTH_SECRET
Generate a secret key using one of the following methods:

Using PowerShell
Open PowerShell and run the following command:

```
[System.Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```


2. **Add the following environment variables to your `.env` file:**

    ```
    GOOGLE_CLIENT_ID= your google client id
    GOOGLE_CLIENT_SECRET=your google client secret
    NEXTAUTH_URL=http://localhost:3000
    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
    NEXTAUTH_SECRET=your next auth secret
    ```

3. **Set up OAuth 2.0 in Google Cloud Console:**

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Select your project.
    - Navigate to `APIs & Services` > `Credentials`.
    - Create a new OAuth 2.0 Client ID or edit the existing one.
    - Add `http://localhost:3000/api/auth/callback/google` to the `Authorized redirect URIs`.

## Running the Project

To run the project locally:

1. **Start the development server:**

    ```sh
    npm run dev
    ```

2. **Open your browser and navigate to:**

    ```
    http://localhost:3000
    ```

## Deployment

To deploy the project, you can use platforms like Vercel which offer seamless integration with Next.js projects.

1. **Push your code to a Git repository (e.g., GitHub):**

    ```sh
    git add .
    git commit -m "Initial commit"
    git push origin main
    ```

2. **Deploy on Vercel:**

    - Go to the [Vercel website](https://vercel.com/).
    - Sign up and connect your GitHub repository.
    - Import your project and configure the environment variables in Vercel with the same keys and values from your `.env` file.
    - Deploy your project.

## Notes

- Ensure that your `.env` file is included in your `.gitignore` file to prevent sensitive information from being pushed to your repository.
- For further customization and troubleshooting, refer to the [NextAuth.js documentation](https://next-auth.js.org/getting-started/introduction) and [Next.js documentation](https://nextjs.org/docs).

---

By following these instructions, you should be able to set up, run, and deploy the Email-X project successfully.
