import AuthLayout from '../components/layout/AuthLayout';
import SignupForm from '../components/auth/SignupForm';

const Signup = () => {
    return (
        <AuthLayout 
            title="Create an Account" 
            description="Join us today and secure your workspace"
        >
            <SignupForm />
        </AuthLayout>
    );
};

export default Signup;
