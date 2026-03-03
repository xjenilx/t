import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';

export const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Creator Basic",
      price: "9",
      description: "Perfect for individuals starting out with AI generation.",
      features: [
        { text: "100 Image Generations", included: true },
        { text: "20 Video Generations", included: true },
        { text: "Standard Resolution", included: true },
        { text: "Brand Kit Access", included: false },
      ],
      cta: "Current Plan",
      highlight: false
    },
    {
      name: "Agency Pro",
      price: "29",
      description: "Unlimited generation for professional content creators.",
      features: [
        { text: "Unlimited Image Generations", included: true },
        { text: "Unlimited Video Generations", included: true },
        { text: "8K Ultra High Resolution", included: true },
        { text: "Full Brand Kit Access", included: true },
      ],
      cta: "Upgrade to Pro",
      highlight: true
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 block">Pricing</span>
        <h1 className="text-5xl font-extrabold mb-6">Pricing Plans</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Our Pricing Plans are simple, transparent and flexible. Choose the plan that best suits your needs.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="glass-card p-12 max-w-md w-full text-center">
              <div className="bg-emerald-500/20 p-4 rounded-full w-fit mx-auto mb-6">
                <Check className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Plan Selected!</h2>
              <p className="text-white/60 mb-8">You've successfully chosen the <strong>{selectedPlan}</strong> plan. Ready to generate viral content?</p>
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold transition-all"
              >
                Let's Go
              </button>
            </div>
          </motion.div>
        )}

        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`relative p-10 rounded-[2.5rem] border text-left flex flex-col ${plan.highlight
              ? 'bg-indigo-600/10 border-indigo-500/30 shadow-2xl shadow-indigo-500/10'
              : 'bg-white/5 border-white/10'
              }`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 right-8 bg-indigo-600 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg shadow-indigo-500/40 border border-indigo-400/30">
                Most Popular
              </div>
            )}

            <h3 className="text-3xl font-black mb-3 tracking-tight">{plan.name}</h3>
            <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">{plan.description}</p>

            <div className="flex items-baseline gap-2 mb-12">
              <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
              <span className="text-white/40 font-bold text-lg">/mo</span>
            </div>

            <div className="space-y-5 mb-16 flex-grow">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-indigo-400 stroke-[3px]" />
                  ) : (
                    <X className="w-5 h-5 text-white/10 stroke-[3px]" />
                  )}
                  <span className={`text-base font-semibold ${feature.included ? 'text-white/80' : 'text-white/10'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPlan(plan.name)}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${plan.highlight
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/10'
                }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
