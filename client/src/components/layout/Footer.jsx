import { Link } from 'react-router-dom';
import { FaTint, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        'Quick Links': [
            { name: 'About Us', href: '#about' },
            { name: 'Find Donors', href: '#donors' },
            { name: 'Donate Blood', href: '/signup' },
            { name: 'Contact', href: '#contact' },
        ],
        'Resources': [
            { name: 'Blood Types', href: '#' },
            { name: 'Eligibility', href: '#' },
            { name: 'FAQs', href: '#' },
            { name: 'Blog', href: '#' },
        ],
        'Legal': [
            { name: 'Privacy Policy', href: '#' },
            { name: 'Terms of Service', href: '#' },
            { name: 'Cookie Policy', href: '#' },
        ],
    };

    const socialLinks = [
        { icon: FaFacebook, href: '#', label: 'Facebook' },
        { icon: FaTwitter, href: '#', label: 'Twitter' },
        { icon: FaInstagram, href: '#', label: 'Instagram' },
        { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 group mb-4">
                            <FaTint className="text-2xl text-red-500" />
                            <span className="text-2xl font-bold gradient-brand bg-clip-text text-transparent">
                                Raktasahayog
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-4 max-w-sm">
                            Connecting donors with those in need. Every drop counts in saving lives.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="p-2 bg-gray-800 rounded-full hover:bg-red-600 transition-colors duration-200"
                                >
                                    <social.icon className="text-xl" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-white font-semibold mb-4">{title}</h3>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                        >
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
                    <p>&copy; {currentYear} Raktasahayog. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
