import BenefitBadge from "./BenefitBadge";

export default function JobBenefits({ benefits = [], compact = false }) {
  if (!benefits.length) return null;
  if (compact) {
    return (
      <p className="job-benefits-summary" aria-label={`Benefits: ${benefits.join(", ")}`}>
        ✓ {benefits.join(" • ")}
      </p>
    );
  }
  return (
    <div className="benefit-row large">
      {benefits.map((benefit) => <BenefitBadge key={benefit}>{benefit}</BenefitBadge>)}
    </div>
  );
}
