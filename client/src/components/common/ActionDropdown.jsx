import React from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ActionDropdown = ({ children }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-full transition-colors focus:outline-none"
                    aria-label="Options"
                >
                    <FaEllipsisV />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 p-1"
            >
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        // Extract props from the passed button (e.g. onClick, className, children)
                        const { onClick, className, children: childContent } = child.props;

                        return (
                            <DropdownMenuItem
                                onClick={onClick}
                                className={`cursor-pointer px-4 py-2.5 text-sm flex justify-start items-center gap-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${className || 'text-gray-700 dark:text-gray-200'}`}
                            >
                                {childContent}
                            </DropdownMenuItem>
                        );
                    }
                    return null;
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActionDropdown;
