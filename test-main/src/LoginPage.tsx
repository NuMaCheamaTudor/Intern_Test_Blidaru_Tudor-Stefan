import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Send login request
        console.log("Login", { email, password });
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Welcome back 👋
                </h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        type="email"
                        required
                    />
                    <Input
                        placeholder="Password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        type="password"
                        required
                    />
                    <Button className="w-full" type="submit">
                        Log in
                    </Button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}