export default function Footer() {
    return (
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Automate. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="/privacy" className="hover:text-primary-400 hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary-400 hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    );
  }  