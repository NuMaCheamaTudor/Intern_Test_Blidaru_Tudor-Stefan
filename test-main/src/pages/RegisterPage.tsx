import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        remember: false,
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch("http://localhost:3000/api/register", {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                navigate("/login");
            } else {
                const message = await res.text();
                setError(message || "Registration failed");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <header className="absolute top-6 left-6 text-sm font-semibold tracking-wide text-gray-900">
                <span className="font-bold">LOGO</span> COMPANY
            </header>

            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900">Sign up</h2>
                <p className="text-sm text-center text-gray-500 mt-1 mb-6">Sign up to continue</p>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        className="border w-full px-3 py-2 rounded"
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border w-full px-3 py-2 rounded"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        type="email"
                        required
                    />
                    <input
                        className="border w-full px-3 py-2 rounded"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        type="password"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">
                        Sign up
                    </button>
                    <label className="flex items-center text-sm text-gray-600">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={form.remember}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        Remember me
                    </label>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}