import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const DealerHeader: React.FC = () => {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-4"
        >
            <h1 className="text-4xl font-bold text-white mb-3">{t('dealers.title')}</h1>
            <p className="text-xl text-gray-300">{t('dealers.subtitle')}</p>
        </motion.div>
    );
};

export default DealerHeader;
