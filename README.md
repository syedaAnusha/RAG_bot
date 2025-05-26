# DocuMind - AI-Powered Document Q&amp;A

DocuMind is an intelligent document analysis and question-answering system built with Next.js and LangChain. Upload your documents and ask questions to get accurate, AI-powered answers with source references.

## Features

- 📄 **Document Processing**: Upload and process PDF, DOCX, and TXT files (up to 10MB)
- 🤖 **AI-Powered Answers**: Get precise answers to questions about your documents
- 🔍 **Source References**: View the exact sources and locations of information in your documents
- 🎨 **Modern UI**: Clean, responsive interface with dark mode support
- ⚡ **Real-time Updates**: See processing status and progress in real-time

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Configure environment variables:

```env
NEXT_PUBLIC_BACKEND_URL=your_backend_url
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to use DocuMind

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **AI/ML**:
  - Access via APIs written in python (backend)

## Development

This project follows Next.js best practices and uses TypeScript for type safety. The main components are:

- `RagChat`: Main application component
- `Chat`: Handles chat interface and message management
- `DocumentSidebar`: Manages document uploads and listings

## Deployment

The application can be deployed using [Vercel](https://vercel.com). For other platforms, build the application using:

```bash
npm run build
npm start
```
