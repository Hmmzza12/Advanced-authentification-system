import { SiGoogle, SiGithub, SiFacebook } from 'react-icons/si';

const SocialLoginButtons = () => {
    const GOOGLE_AUTH_URL = `http://localhost:8080/oauth2/authorize/google?redirect_uri=http://localhost:5173/oauth2/redirect`;
    const GITHUB_AUTH_URL = `http://localhost:8080/oauth2/authorize/github?redirect_uri=http://localhost:5173/oauth2/redirect`;
    const FACEBOOK_AUTH_URL = `http://localhost:8080/oauth2/authorize/facebook?redirect_uri=http://localhost:5173/oauth2/redirect`;

    return (
        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
                <a
                    href={GOOGLE_AUTH_URL}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <span className="sr-only">Sign in with Google</span>
                    <SiGoogle className="w-5 h-5 text-[#DB4437]" />
                </a>

                <a
                    href={FACEBOOK_AUTH_URL}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <span className="sr-only">Sign in with Facebook</span>
                    <SiFacebook className="w-5 h-5 text-[#4267B2]" />
                </a>

                <a
                    href={GITHUB_AUTH_URL}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <span className="sr-only">Sign in with GitHub</span>
                    <SiGithub className="w-5 h-5 text-gray-900 dark:text-white" />
                </a>
            </div>
        </div>
    );
};

export default SocialLoginButtons;
