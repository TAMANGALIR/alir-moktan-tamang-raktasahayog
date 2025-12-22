import { motion } from 'framer-motion';
import { FaTint, FaHandHoldingHeart, FaUserMd, FaChartLine, FaCheckCircle, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const features = [
        {
            icon: FaTint,
            title: 'Easy Registration',
            description: 'Quick and simple donor registration process to get you started in minutes.',
        },
        {
            icon: FaHandHoldingHeart,
            title: 'Find Donors',
            description: 'Search and connect with compatible blood donors in your area instantly.',
        },
        {
            icon: FaUserMd,
            title: 'Verified Donors',
            description: 'All donors are verified to ensure safety and reliability.',
        },
        {
            icon: FaChartLine,
            title: 'Track Donations',
            description: 'Keep track of your donation history and impact on saving lives.',
        },
    ];

    const stats = [
        { number: '10,000+', label: 'Active Donors' },
        { number: '5,000+', label: 'Lives Saved' },
        { number: '50+', label: 'Partner Hospitals' },
        { number: '24/7', label: 'Support Available' },
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Regular Donor',
            content: 'Raktasahayog made it so easy to donate blood. The process is seamless and I feel great knowing I\'m helping save lives.',
            rating: 5,
        },
        {
            name: 'Michael Chen',
            role: 'Recipient',
            content: 'When my father needed blood urgently, Raktasahayog connected us with donors within hours. Forever grateful!',
            rating: 5,
        },
        {
            name: 'Dr. Emily Rodriguez',
            role: 'Hospital Partner',
            content: 'As a healthcare professional, I appreciate how Raktasahayog streamlines the blood donation process.',
            rating: 5,
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-red-200/30 to-orange-200/30 dark:from-red-900/20 dark:to-orange-900/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [90, 0, 90],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-200/30 to-red-200/30 dark:from-orange-900/20 dark:to-red-900/20 rounded-full blur-3xl"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="gradient-brand bg-clip-text text-transparent">
                                Save Lives
                            </span>
                            <br />
                            <span className="text-gray-900 dark:text-white">
                                One Drop at a Time
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            Connect with blood donors instantly. Raktasahayog makes it easy to donate blood and help those in need.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="px-8 py-4 gradient-brand text-white font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
                            >
                                Become a Donor
                            </Link>
                            <button
                                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-semibold rounded-lg border-2 border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition-all duration-200 text-lg"
                            >
                                Learn More
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                className="glass p-6 rounded-xl"
                            >
                                <div className="text-3xl md:text-4xl font-bold gradient-brand bg-clip-text text-transparent mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="about" className="min-h-screen flex items-center bg-white dark:bg-gray-950">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="gradient-brand bg-clip-text text-transparent">Why Choose</span>
                            <span className="text-gray-900 dark:text-white"> Raktasahayog?</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We make blood donation simple, safe, and impactful.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="glass p-6 rounded-xl hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="w-14 h-14 gradient-brand rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="text-2xl text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="min-h-screen flex items-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="text-gray-900 dark:text-white">What Our </span>
                            <span className="gradient-brand bg-clip-text text-transparent">Community Says</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Real stories from donors and recipients who trust Raktasahayog.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="glass p-6 rounded-xl"
                            >
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            <span className="gradient-brand bg-clip-text text-transparent">
                                Ready to Make a Difference?
                            </span>
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of donors who are saving lives every day. Your contribution matters.
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-10 py-4 gradient-brand text-white font-semibold rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 text-lg"
                        >
                            Get Started Today
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
