import {
  SAFETY_OFFER_SECTIONS,
  type SafetyOfferBlock,
} from '../../data/safetyOfferContent';

const renderBlock = (block: SafetyOfferBlock, blockKey: string) => {
  if (block.type === 'ul') {
    return (
      <ul key={blockKey} className="list-disc pl-5 space-y-2 text-text-muted leading-relaxed">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <p key={blockKey} className="text-text-muted leading-relaxed">
      {block.text}
    </p>
  );
};

const SafetyOfferContent = () => (
  <div className="flex flex-col gap-12">
    {SAFETY_OFFER_SECTIONS.map((section) => (
      <section key={section.id} aria-labelledby={`${section.id}-heading`}>
        <h2
          id={`${section.id}-heading`}
          className="font-heading text-xl font-normal text-text-primary mb-4 sm:text-2xl"
        >
          {section.title}
        </h2>
        <div className="flex flex-col gap-4">
          {section.blocks.map((block, index) => renderBlock(block, `${section.id}-${index}`))}
        </div>
      </section>
    ))}
  </div>
);

export default SafetyOfferContent;
