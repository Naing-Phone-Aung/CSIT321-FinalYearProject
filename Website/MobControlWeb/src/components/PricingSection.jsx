import React from "react";
import Container from "./Container";
import TitleText from "./ui/TitleText";
import { cn } from "@/lib/utils"; // For combining class names
import { Check } from "lucide-react";
import { FlickeringGrid } from "./magicui/flickering-grid";
import ActionModalTriggerComponent from "./ActionModalTriggerComponent";

const PricingCard = ({ plan }) => (
  <div
    className={cn(
      "relative flex h-full flex-col border-b border-r border-zinc-800 ",
      plan.isFeatured ? "bg-zinc-900/50" : ""
    )}
  >
    <div className="flex justify-between p-8 pb-0">
      <h3 className="text-lg font-medium text-white/80">{plan.name}</h3>
      {plan.isFeatured && (
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-violet-500 text-white  hover:text-ink hover:bg-white">
          <p>Most Popular</p>
        </div>
      )}
    </div>

    <div className="mt-6 px-8 pb-0 flex items-baseline text-white">
      <span className="text-5xl font-medium">{plan.price}</span>
      <span className="ml-1 text-sm text-white/80">
        {plan.priceFrequency}
      </span>
    </div>
    <p className="mt-3 px-8 pb-0 text-white/80 text-sm font-medium">
      {plan.description}
    </p>

    <ul role="list" className="my-8 px-8 pb-0 space-y-4">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center gap-3">
          <Check className="h-5 w-5 flex-shrink-0 text-[#00C950]" />
          <span className="text-white">{feature}</span>
        </li>
      ))}
    </ul>
    <ActionModalTriggerComponent
      buttonText="Get Started"
      buttonClassName={cn(
        "mt-auto block w-full py-4 text-center rounded-none font-medium inline-flex  transition",
        plan.isFeatured
          ? "bg-violet text-white hover:bg-violet-600"
          : "bg-ink text-white"
      )}
    />
  </div>
);

const PricingSection = () => {
  // ========== UPDATED PRICING DATA ==========
  const pricingPlans = [
    {
      name: "Free Plan",
      price: "$0",
      priceFrequency: "/month",
      description: "Perfect for casual gaming and local testing.",
      features: [
        "Ads supported",
        "Use phone as controller",
        "Connect to 1 desktop at a time",
        "Basic layouts (D-pad, joystick)",
        "Limited to 2 custom layouts",
        "Community-based support",
      ],
      isFeatured: false,
    },
    {
      name: "Premium - Monthly",
      price: "$4.99",
      priceFrequency: "/month",
      description: "Unlock the full power of MobController.",
      features: [
        "Ad-free experience",
        "Unlimited game sessions & devices",
        "Cloud data save & sync",
        "Unlimited custom layouts",
        "Access to advanced layouts (gyro, swipe)",
        "Layout sharing & import/export",
        "Priority support",
        "Early access to beta features",
      ],
      isFeatured: true,
    },
    {
      name: "Premium - Annual",
      price: "$39.99",
      priceFrequency: "/year",
      description: "Save ~33% and get exclusive perks.",
      features: [
        "Everything in Monthly Premium",
        "Exclusive seasonal controller skins",
        "1-on-1 developer integration support",
        "Early-access invites to future tools",
      ],
      isFeatured: false,
    },
  ];
  // ===========================================

  return (
    <section id="Pricing">
      <Container>
        <div className="flex flex-col items-center justify-center pt-30">
          <TitleText
            title="Find the Perfect Plan for You"
            text="Whether you're a casual gamer or a pro developer, MobController has a plan that fits your needs. Start for free or unlock powerful features with Premium."
          />
        </div>
        <div className="grid grid-cols-1 mt-10 border-l border-t border-zinc-800 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
        <div className="relative h-[100px] w-full overflow-hidden">
          <FlickeringGrid
            className="absolute inset-0 z-0 size-full bg-ink [mask-image:linear-gradient(to_bottom,black_40%,transparent_80%)]"
            squareSize={4}
            gridGap={6}
            color="white"
            maxOpacity={0.1}
            flickerChance={0.2}
          />
        </div>
      </Container>
    </section>
  );
};

export default PricingSection;