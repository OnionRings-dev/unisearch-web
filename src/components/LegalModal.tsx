import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Scale, Lock, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TERMS_OF_SERVICE, PRIVACY_POLICY, COOKIE_POLICY } from './legal_constants';
import remarkGfm from 'remark-gfm';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentType: 'terms' | 'privacy' | 'cookie';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, documentType }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [isOpen, documentType]);

    if (!isOpen) return null;

    let content = '';
    let title = '';
    let Icon = Scale;

    switch (documentType) {
        case 'terms':
            content = TERMS_OF_SERVICE;
            title = 'Termini di Utilizzo';
            Icon = Scale;
            break;
        case 'privacy':
            content = PRIVACY_POLICY;
            title = 'Informativa sulla Privacy';
            Icon = Lock;
            break;
        case 'cookie':
            content = COOKIE_POLICY;
            title = 'Cookie Policy';
            Icon = Cookie;
            break;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col max-h-[85vh] border border-gray-200 dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Icon className="w-5 h-5 text-[#003366] dark:text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {title}
                        </h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar"
                >
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:text-[#003366] dark:prose-headings:text-blue-100 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex justify-end">
                    <Button onClick={onClose} className="bg-[#003366] hover:bg-[#004080] text-white">
                        Chiudi
                    </Button>
                </div>
            </div>
        </div>
    );
};
