import React from 'react';
import {
    ShoppingBag, Coffee, Car, Home,
    Smartphone, Gift, Heart, Briefcase,
    Utensils, Zap, Bus, Plane,
    Gamepad2, Banknote, CreditCard, Wallet,
    TrendingUp, TrendingDown, ShoppingCart, Target, Settings,
    FileText, HelpCircle
} from 'lucide-react';

const ICON_MAP = {
    ShoppingBag, Coffee, Car, Home,
    Smartphone, Gift, Heart, Briefcase,
    Utensils, Zap, Bus, Plane,
    Gamepad2, Banknote, CreditCard, Wallet,
    TrendingUp, TrendingDown, ShoppingCart, Target, Settings,
    FileText
};

export default function CategoryIcon({ iconName, size = 20, className = '' }) {
    const Icon = ICON_MAP[iconName] || HelpCircle;
    return <Icon size={size} className={className} />;
}

export { ICON_MAP };
