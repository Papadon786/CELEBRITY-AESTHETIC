export type TreatmentCategory = "skin" | "hair" | "aesthetics" | "pmu";

export interface Treatment {
  name: string;
  slug: string;
  category: TreatmentCategory;
  description: string;
  featured?: boolean;
  /** Longer copy used on the treatment detail page. */
  detail: {
    whatIsIt: string;
    whoMayConsider: string;
    whatToExpect: string;
    journey: string;
    aftercare: string;
    faq: { question: string; answer: string }[];
  };
}

export const categoryLabels: Record<TreatmentCategory, string> = {
  skin: "Skin",
  hair: "Hair",
  aesthetics: "Aesthetics",
  pmu: "PMU & Beauty",
};

const genericFaq = (name: string) => [
  {
    question: `Is ${name} suitable for everyone?`,
    answer:
      "Suitability depends on individual skin, hair and health considerations, which is why a consultation is recommended before proceeding.",
  },
  {
    question: `How many sessions of ${name} are typically discussed?`,
    answer:
      "The number of sessions, if any, is discussed during your consultation based on your individual concern and goals.",
  },
];

export const treatments: Treatment[] = [
  // ---------------- SKIN ----------------
  {
    name: "Laser Hair Removal — Men & Women",
    slug: "laser-hair-removal",
    category: "skin",
    featured: true,
    description:
      "A laser-based approach to reducing unwanted hair over a course of sessions, suitable for men and women.",
    detail: {
      whatIsIt:
        "Laser Hair Removal uses focused light energy directed at hair follicles as part of a broader approach to managing unwanted hair growth.",
      whoMayConsider:
        "Men and women exploring longer-term options for managing unwanted hair on the face or body may consider discussing this treatment during a consultation.",
      whatToExpect:
        "A typical session involves a patch test where appropriate, followed by targeted passes over the treatment area; sensations and duration vary by area and individual.",
      journey:
        "Your journey generally begins with a consultation to assess your skin and hair type, followed by a planned course of sessions spaced over time.",
      aftercare:
        "Sun protection and gentle skincare are usually advised for a period following each session; specific aftercare guidance is provided by your practitioner.",
      faq: genericFaq("Laser Hair Removal"),
    },
  },
  {
    name: "Carbon Laser Facial",
    slug: "carbon-laser-facial",
    category: "skin",
    description:
      "A laser-assisted facial technique that uses a carbon layer to help address skin texture and appearance.",
    detail: {
      whatIsIt:
        "The Carbon Laser Facial applies a thin carbon layer to the skin before laser passes, as part of a technique aimed at refining overall skin appearance.",
      whoMayConsider:
        "Those interested in a professionally guided facial technique for skin texture and tone may raise this during a consultation.",
      whatToExpect:
        "The session involves application of the carbon layer followed by laser passes; the process is generally described as comfortable, though sensation can vary.",
      journey:
        "A consultation helps determine whether this technique fits your skin goals, followed by a discussion of an appropriate session plan.",
      aftercare:
        "Gentle, fragrance-free skincare and sun protection are typically recommended afterward, as advised by your practitioner.",
      faq: genericFaq("Carbon Laser Facial"),
    },
  },
  {
    name: "Hydra Facial",
    slug: "hydra-facial",
    category: "skin",
    description:
      "A multi-step facial technique combining cleansing, exfoliation and hydration for the skin.",
    detail: {
      whatIsIt:
        "Hydra Facial is a multi-step device-assisted facial that combines cleansing, gentle exfoliation and hydration in one session.",
      whoMayConsider:
        "Individuals looking for a refreshing, guided facial technique as part of their broader skincare routine may consider this option.",
      whatToExpect:
        "The session moves through several gentle steps; most describe the process as relaxing, with no significant downtime.",
      journey:
        "A short consultation helps tailor the session to your skin's current needs before the facial begins.",
      aftercare:
        "Standard daily skincare and sun protection are generally recommended afterward.",
      faq: genericFaq("Hydra Facial"),
    },
  },
  {
    name: "Pigmentation Treatment",
    slug: "pigmentation-treatment",
    category: "skin",
    description:
      "A targeted approach to addressing areas of uneven skin tone and pigmentation.",
    detail: {
      whatIsIt:
        "Pigmentation Treatment refers to a set of techniques used to address areas of uneven tone or discolouration in the skin.",
      whoMayConsider:
        "Those concerned about patches of uneven pigmentation may wish to discuss suitable options at a consultation.",
      whatToExpect:
        "Your practitioner will assess your skin and discuss an approach suited to the type and depth of pigmentation.",
      journey:
        "Treatment typically follows an initial assessment, with a plan reviewed and adjusted over time as needed.",
      aftercare:
        "Diligent sun protection is usually emphasised, alongside any specific product guidance from your practitioner.",
      faq: genericFaq("Pigmentation Treatment"),
    },
  },
  {
    name: "Acne Treatment",
    slug: "acne-treatment",
    category: "skin",
    description:
      "A consultation-led approach to addressing active acne and supporting clearer-looking skin over time.",
    detail: {
      whatIsIt:
        "Acne Treatment covers a range of professionally guided techniques intended to help manage active acne concerns.",
      whoMayConsider:
        "Individuals experiencing active breakouts who would like a structured, professional approach may consider a consultation.",
      whatToExpect:
        "Your practitioner will review your skin history and current concern before recommending an approach.",
      journey:
        "A course of visits is typically planned, with adjustments made based on how your skin responds over time.",
      aftercare:
        "A consistent home skincare routine and sun protection are usually advised alongside in-clinic sessions.",
      faq: genericFaq("Acne Treatment"),
    },
  },
  {
    name: "Acne Scar Treatment",
    slug: "acne-scar-treatment",
    category: "skin",
    description:
      "A technique-based approach aimed at improving the appearance of scarring left by past acne.",
    detail: {
      whatIsIt:
        "Acne Scar Treatment involves techniques intended to improve the appearance of textural changes left behind by previous acne.",
      whoMayConsider:
        "Those with visible acne scarring who are curious about available options may raise this at a consultation.",
      whatToExpect:
        "An assessment of scar type and depth guides the discussion of a suitable technique and expected course of sessions.",
      journey:
        "Improvement is generally considered a gradual process, discussed and reviewed across a planned course of sessions.",
      aftercare:
        "Sun protection and gentle skincare are typically recommended during the course of treatment.",
      faq: genericFaq("Acne Scar Treatment"),
    },
  },
  {
    name: "Chemical Peels",
    slug: "chemical-peels",
    category: "skin",
    description:
      "A resurfacing technique using a topical solution to help refine skin texture and tone.",
    detail: {
      whatIsIt:
        "Chemical Peels use a topical solution applied to the skin as part of a resurfacing technique.",
      whoMayConsider:
        "Individuals interested in professionally guided skin resurfacing may discuss whether a peel suits their skin type.",
      whatToExpect:
        "A peel solution appropriate to your skin is selected and applied for a set period, followed by neutralising and aftercare steps.",
      journey:
        "Peels are often planned as a short course, with strength adjusted according to how your skin responds.",
      aftercare:
        "Sun protection and avoiding harsh actives are usually advised for a period following each peel.",
      faq: genericFaq("Chemical Peels"),
    },
  },
  {
    name: "Skin Lightening",
    slug: "skin-lightening",
    category: "skin",
    description:
      "A consultation-led approach to addressing tonal concerns and uneven skin brightness.",
    detail: {
      whatIsIt:
        "Skin Lightening refers to professionally guided techniques and product regimens intended to address tonal unevenness.",
      whoMayConsider:
        "Those with concerns about uneven tone or dullness may wish to discuss suitable approaches during a consultation.",
      whatToExpect:
        "Your practitioner will review your skin and history before recommending a suitable plan.",
      journey:
        "Any recommended plan is typically reviewed periodically and adjusted as needed.",
      aftercare:
        "Daily sun protection is generally emphasised throughout any recommended regimen.",
      faq: genericFaq("Skin Lightening"),
    },
  },
  {
    name: "Post-Pregnancy Stretch Mark Removal",
    slug: "post-pregnancy-stretch-mark-removal",
    category: "skin",
    description:
      "A supportive treatment approach for addressing the appearance of stretch marks following pregnancy.",
    detail: {
      whatIsIt:
        "This treatment covers techniques intended to help improve the appearance of stretch marks that can occur after pregnancy.",
      whoMayConsider:
        "New mothers curious about options for stretch mark appearance may wish to raise this at a consultation.",
      whatToExpect:
        "An assessment of the affected area guides the discussion of a suitable technique and realistic expectations.",
      journey:
        "A course of sessions is typically planned and reviewed over time.",
      aftercare:
        "Gentle skincare and sun protection are generally advised for treated areas.",
      faq: genericFaq("Post-Pregnancy Stretch Mark Removal"),
    },
  },
  {
    name: "Vampire Facial",
    slug: "vampire-facial",
    category: "skin",
    description:
      "A treatment technique that uses a person's own processed blood components as part of a facial protocol.",
    detail: {
      whatIsIt:
        "Often referred to informally as a 'Vampire Facial', this technique incorporates a person's own processed blood components into a facial protocol.",
      whoMayConsider:
        "Those interested in this specific technique should discuss it in detail with a practitioner to understand suitability.",
      whatToExpect:
        "The process involves a blood draw, processing, and application alongside microneedling or similar techniques.",
      journey:
        "A consultation covers the full process in detail before any session is booked.",
      aftercare:
        "Your practitioner will provide specific aftercare guidance following the session.",
      faq: genericFaq("Vampire Facial"),
    },
  },
  {
    name: "Melasma Treatment",
    slug: "melasma-treatment",
    category: "skin",
    description:
      "A consultation-led approach to managing the appearance of melasma-related pigmentation.",
    detail: {
      whatIsIt:
        "Melasma Treatment refers to approaches used to help manage the appearance of melasma, a common pigmentation pattern.",
      whoMayConsider:
        "Individuals noticing patches associated with melasma may wish to discuss management options at a consultation.",
      whatToExpect:
        "Your practitioner will discuss triggers, sun exposure, and a suitable long-term management approach.",
      journey:
        "Melasma is often described as needing ongoing, patient management rather than a single fix.",
      aftercare:
        "Strict daily sun protection is generally considered central to any melasma management plan.",
      faq: genericFaq("Melasma Treatment"),
    },
  },
  {
    name: "Scar Revision",
    slug: "scar-revision",
    category: "skin",
    description:
      "A technique-based approach to addressing the appearance of scars from injury or surgery.",
    detail: {
      whatIsIt:
        "Scar Revision covers a range of techniques used to address the appearance of scars from various causes.",
      whoMayConsider:
        "Individuals with scars they would like to discuss options for may consider a consultation.",
      whatToExpect:
        "An assessment of the scar's age, depth and cause guides the discussion of a suitable approach.",
      journey:
        "Improvement is generally considered a gradual, monitored process across a planned course of sessions.",
      aftercare:
        "Sun protection and any product guidance provided by your practitioner should be followed closely.",
      faq: genericFaq("Scar Revision"),
    },
  },
  {
    name: "BB Glow Facial",
    slug: "bb-glow-facial",
    category: "skin",
    description:
      "A semi-permanent tinted facial technique intended to even out the appearance of the skin's surface.",
    detail: {
      whatIsIt:
        "BB Glow Facial is a technique that applies a tinted serum to the skin's surface using a microneedling-based method.",
      whoMayConsider:
        "Those looking for a temporary, tinted evening of the skin's surface tone may discuss this during a consultation.",
      whatToExpect:
        "A tinted formulation is applied using fine needling; results and duration vary by individual.",
      journey:
        "A course of sessions is generally discussed to establish and then maintain the desired look.",
      aftercare:
        "Gentle cleansing and sun protection are typically advised in the days following a session.",
      faq: genericFaq("BB Glow Facial"),
    },
  },
  {
    name: "MNRF",
    slug: "mnrf",
    category: "skin",
    description:
      "Microneedling radiofrequency, a device-based technique combining fine needling with radiofrequency energy.",
    detail: {
      whatIsIt:
        "MNRF (Microneedling Radiofrequency) combines fine needling with radiofrequency energy delivered into the skin.",
      whoMayConsider:
        "Individuals interested in device-based skin texture techniques may raise MNRF during a consultation.",
      whatToExpect:
        "Numbing cream is typically applied before the device is passed over the treatment area.",
      journey:
        "A course of sessions is usually planned, spaced several weeks apart.",
      aftercare:
        "Mild redness can occur; sun protection and gentle skincare are generally recommended afterward.",
      faq: genericFaq("MNRF"),
    },
  },
  {
    name: "IV Glutathione",
    slug: "iv-glutathione",
    category: "skin",
    description:
      "An intravenously administered antioxidant compound offered as part of a broader wellness and skin discussion.",
    detail: {
      whatIsIt:
        "IV Glutathione refers to intravenous administration of this antioxidant compound, discussed as part of a broader wellness conversation.",
      whoMayConsider:
        "This is discussed on an individual basis during a consultation with a qualified professional.",
      whatToExpect:
        "Administration is performed under professional supervision in a clinic setting.",
      journey:
        "A thorough consultation and health review precedes any recommendation.",
      aftercare:
        "Your practitioner will advise on any specific post-session guidance.",
      faq: genericFaq("IV Glutathione"),
    },
  },
  {
    name: "Under-Eye Dark Circles",
    slug: "under-eye-dark-circles",
    category: "skin",
    description:
      "A consultation-led approach to addressing the appearance of dark circles around the eyes.",
    detail: {
      whatIsIt:
        "This treatment area covers a range of approaches used to address the appearance of under-eye darkness.",
      whoMayConsider:
        "Those concerned about the appearance of under-eye circles may wish to explore options at a consultation.",
      whatToExpect:
        "An assessment of the underlying cause (pigment, volume, or vascularity) guides the discussion of a suitable approach.",
      journey:
        "A tailored plan is discussed following assessment, with realistic expectations set from the outset.",
      aftercare:
        "Sun protection and gentle eye-area skincare are typically recommended.",
      faq: genericFaq("Under-Eye Dark Circles"),
    },
  },
  {
    name: "Underarm Pigmentation",
    slug: "underarm-pigmentation",
    category: "skin",
    description:
      "A targeted approach to addressing darker pigmentation in the underarm area.",
    detail: {
      whatIsIt:
        "This treatment addresses concerns around darker pigmentation specifically in the underarm area.",
      whoMayConsider:
        "Individuals concerned about underarm pigmentation may wish to discuss suitable techniques at a consultation.",
      whatToExpect:
        "Your practitioner will assess the area and discuss a technique suited to your skin.",
      journey:
        "A course of sessions is typically planned and reviewed over time.",
      aftercare:
        "Gentle skincare for the area is generally recommended following each session.",
      faq: genericFaq("Underarm Pigmentation"),
    },
  },

  // ---------------- HAIR ----------------
  {
    name: "Hairfall Treatment",
    slug: "hairfall-treatment",
    category: "hair",
    description:
      "A consultation-led approach to assessing and addressing concerns around hair fall.",
    detail: {
      whatIsIt:
        "Hairfall Treatment covers a range of approaches intended to help address concerns around excessive hair shedding.",
      whoMayConsider:
        "Anyone noticing increased hair fall may wish to have this assessed during a consultation.",
      whatToExpect:
        "An assessment of scalp and hair condition guides discussion of a suitable, personalised approach.",
      journey:
        "A plan is typically reviewed over a period of months, as hair growth cycles are gradual.",
      aftercare:
        "Your practitioner will advise on suitable haircare practices to support your plan.",
      faq: genericFaq("Hairfall Treatment"),
    },
  },
  {
    name: "Advanced PRP",
    slug: "advanced-prp",
    category: "hair",
    description:
      "Platelet-rich plasma prepared from a person's own blood, used as part of a scalp treatment protocol.",
    detail: {
      whatIsIt:
        "Advanced PRP (Platelet-Rich Plasma) is prepared from a small blood sample and applied to the scalp as part of a hair care protocol.",
      whoMayConsider:
        "Individuals exploring scalp-focused approaches to hair concerns may discuss PRP during a consultation.",
      whatToExpect:
        "A blood draw is processed before being applied to the scalp using fine injections.",
      journey:
        "A course of sessions is typically spaced over several weeks, with progress reviewed periodically.",
      aftercare:
        "Mild scalp sensitivity can occur; your practitioner will advise on appropriate aftercare.",
      faq: genericFaq("Advanced PRP"),
    },
  },
  {
    name: "Advanced GFC",
    slug: "advanced-gfc",
    category: "hair",
    description:
      "Growth factor concentrate, a scalp-focused technique offered as part of a hair care protocol.",
    detail: {
      whatIsIt:
        "Advanced GFC (Growth Factor Concentrate) is a technique that applies concentrated growth factors to the scalp.",
      whoMayConsider:
        "Those exploring scalp treatments for hair concerns may raise GFC as an option at a consultation.",
      whatToExpect:
        "The session involves preparation of the concentrate followed by application to the scalp.",
      journey:
        "A planned course of sessions is typically discussed, with reviews along the way.",
      aftercare:
        "Your practitioner will provide guidance specific to your scalp condition.",
      faq: genericFaq("Advanced GFC"),
    },
  },
  {
    name: "Exosomes",
    slug: "exosomes",
    category: "hair",
    description:
      "A scalp-focused technique using exosome-based formulations as part of a hair care protocol.",
    detail: {
      whatIsIt:
        "Exosome-based scalp treatments involve applying specialised formulations as part of a hair care protocol.",
      whoMayConsider:
        "Individuals interested in newer scalp-focused techniques may discuss this option during a consultation.",
      whatToExpect:
        "A topical or injected formulation is applied to the scalp, depending on the specific protocol discussed.",
      journey:
        "A course of sessions is typically planned and reviewed with your practitioner over time.",
      aftercare:
        "Aftercare guidance is provided based on the specific protocol used.",
      faq: genericFaq("Exosomes"),
    },
  },
  {
    name: "Hair Transplant",
    slug: "hair-transplant",
    category: "hair",
    description:
      "A surgical hair restoration technique discussed in depth during a dedicated consultation.",
    detail: {
      whatIsIt:
        "Hair Transplant is a surgical technique used to relocate hair follicles as part of a hair restoration approach.",
      whoMayConsider:
        "Individuals exploring surgical options for hair restoration should have a detailed consultation to assess suitability.",
      whatToExpect:
        "The procedure and preparation are explained thoroughly by your practitioner ahead of any decision.",
      journey:
        "A dedicated, in-depth consultation and assessment precedes any procedure discussion.",
      aftercare:
        "Detailed aftercare instructions are provided directly by your practitioner given the nature of the procedure.",
      faq: genericFaq("Hair Transplant"),
    },
  },
  {
    name: "Hair Patch",
    slug: "hair-patch",
    category: "hair",
    description:
      "A non-surgical hair replacement option discussed as an alternative approach to hair concerns.",
    detail: {
      whatIsIt:
        "A Hair Patch is a non-surgical hair replacement system fitted to address areas of hair loss.",
      whoMayConsider:
        "Those seeking a non-surgical option for hair coverage may wish to discuss this during a consultation.",
      whatToExpect:
        "Fitting involves assessment of the area and selection of a suitable patch and attachment method.",
      journey:
        "Ongoing maintenance appointments are typically part of the ongoing journey with a hair patch.",
      aftercare:
        "Your practitioner will advise on care and maintenance routines specific to the patch.",
      faq: genericFaq("Hair Patch"),
    },
  },
  {
    name: "Dandruff Treatment",
    slug: "dandruff-treatment",
    category: "hair",
    description:
      "A scalp-focused approach to addressing flaking and irritation associated with dandruff.",
    detail: {
      whatIsIt:
        "Dandruff Treatment covers scalp-focused approaches intended to help address flaking and associated irritation.",
      whoMayConsider:
        "Anyone experiencing persistent dandruff may wish to have their scalp assessed during a consultation.",
      whatToExpect:
        "An assessment of the scalp guides discussion of a suitable routine or in-clinic approach.",
      journey:
        "A plan is typically reviewed over a period of weeks to assess response.",
      aftercare:
        "Your practitioner will advise on suitable ongoing scalp care.",
      faq: genericFaq("Dandruff Treatment"),
    },
  },
  {
    name: "SMP",
    slug: "smp-hair",
    category: "hair",
    description:
      "Scalp Micropigmentation, a technique that creates the appearance of density using fine pigment deposits.",
    detail: {
      whatIsIt:
        "SMP (Scalp Micropigmentation) is a technique that deposits fine pigment into the scalp to create the appearance of density.",
      whoMayConsider:
        "Individuals looking for a way to visually address thinning areas may discuss SMP during a consultation.",
      whatToExpect:
        "The technique is applied over one or more sessions depending on the area and desired look.",
      journey:
        "A consultation establishes the desired look before a session plan is agreed.",
      aftercare:
        "Specific aftercare guidance for the scalp is provided following each session.",
      faq: genericFaq("SMP"),
    },
  },

  // ---------------- AESTHETICS ----------------
  {
    name: "Botox",
    slug: "botox",
    category: "aesthetics",
    description:
      "An injectable technique commonly discussed for softening the appearance of certain facial lines.",
    detail: {
      whatIsIt:
        "Botox refers to a well-known injectable technique used to soften the appearance of certain dynamic facial lines.",
      whoMayConsider:
        "Individuals interested in this technique should discuss suitability and expectations at a dedicated consultation.",
      whatToExpect:
        "The session is typically brief, involving small injections in the discussed treatment area.",
      journey:
        "A thorough consultation covers the technique, areas, and realistic expectations before any session.",
      aftercare:
        "Your practitioner will provide specific aftercare instructions following your session.",
      faq: genericFaq("Botox"),
    },
  },
  {
    name: "Fillers",
    slug: "fillers",
    category: "aesthetics",
    description:
      "An injectable technique used to discuss volume and contour in specific facial areas.",
    detail: {
      whatIsIt:
        "Fillers refer to injectable techniques used to address volume or contour in specific facial areas.",
      whoMayConsider:
        "Those curious about volume or contour techniques should discuss options and suitability at a consultation.",
      whatToExpect:
        "The session involves careful assessment followed by targeted injections in the discussed area.",
      journey:
        "A detailed consultation precedes any session to align on desired outcome and realistic expectations.",
      aftercare:
        "Aftercare guidance specific to the treated area is provided by your practitioner.",
      faq: genericFaq("Fillers"),
    },
  },
  {
    name: "HIFU — Double Chin",
    slug: "hifu-double-chin",
    category: "aesthetics",
    description:
      "High-intensity focused ultrasound directed at the area beneath the chin, discussed as part of a broader plan.",
    detail: {
      whatIsIt:
        "HIFU (High-Intensity Focused Ultrasound) directs focused ultrasound energy at the treatment area, here focused beneath the chin.",
      whoMayConsider:
        "Those interested in non-surgical techniques for the chin/jaw area may discuss HIFU at a consultation.",
      whatToExpect:
        "The device is passed over the treatment area; sensation during the session can vary by individual.",
      journey:
        "A consultation covers assessment of the area and a discussion of a suitable session plan.",
      aftercare:
        "Mild warmth or redness can follow; your practitioner will advise on aftercare.",
      faq: genericFaq("HIFU — Double Chin"),
    },
  },
  {
    name: "Thread Lift",
    slug: "thread-lift",
    category: "aesthetics",
    description:
      "A technique using fine threads discussed as part of a broader facial contour conversation.",
    detail: {
      whatIsIt:
        "Thread Lift is a technique that uses fine threads placed beneath the skin as part of a facial contour approach.",
      whoMayConsider:
        "Individuals interested in this specific technique should have a thorough consultation to discuss suitability.",
      whatToExpect:
        "The procedure and sensation are explained in detail by your practitioner prior to any session.",
      journey:
        "A dedicated consultation and assessment precedes any procedure discussion.",
      aftercare:
        "Specific aftercare instructions are provided by your practitioner given the nature of the technique.",
      faq: genericFaq("Thread Lift"),
    },
  },
  {
    name: "MNRF",
    slug: "mnrf-aesthetics",
    category: "aesthetics",
    description:
      "Microneedling radiofrequency, discussed here in the context of facial contour and skin tightening goals.",
    detail: {
      whatIsIt:
        "In an aesthetics context, MNRF combines fine needling with radiofrequency energy as part of a facial contour discussion.",
      whoMayConsider:
        "Those interested in device-based facial contour techniques may raise MNRF during a consultation.",
      whatToExpect:
        "Numbing cream is typically applied before the device is passed over the treatment area.",
      journey:
        "A course of sessions is usually planned, spaced several weeks apart, and reviewed together.",
      aftercare:
        "Mild redness can occur; sun protection and gentle skincare are generally recommended afterward.",
      faq: genericFaq("MNRF"),
    },
  },
  {
    name: "Carbon Laser Facial",
    slug: "carbon-laser-facial-aesthetics",
    category: "aesthetics",
    description:
      "A laser-assisted technique also discussed within an aesthetics context for overall skin refinement.",
    detail: {
      whatIsIt:
        "In an aesthetics context, the Carbon Laser Facial is discussed as part of a broader skin refinement conversation.",
      whoMayConsider:
        "Those interested in a professionally guided facial technique for skin texture and tone may raise this during a consultation.",
      whatToExpect:
        "The session involves application of the carbon layer followed by laser passes; the process is generally described as comfortable.",
      journey:
        "A consultation helps determine whether this technique fits your goals, followed by discussion of an appropriate plan.",
      aftercare:
        "Gentle, fragrance-free skincare and sun protection are typically recommended afterward.",
      faq: genericFaq("Carbon Laser Facial"),
    },
  },
  {
    name: "Skin Rejuvenation",
    slug: "skin-rejuvenation",
    category: "aesthetics",
    description:
      "A broad, consultation-led category of techniques aimed at supporting overall skin appearance.",
    detail: {
      whatIsIt:
        "Skin Rejuvenation is a broad category covering multiple techniques aimed at supporting the skin's overall appearance.",
      whoMayConsider:
        "Anyone interested in a general refresh to their skin's appearance may wish to explore options at a consultation.",
      whatToExpect:
        "Your practitioner will discuss which technique(s) within this category may suit your goals.",
      journey:
        "A tailored plan is typically discussed following an initial assessment.",
      aftercare:
        "Aftercare will depend on the specific technique(s) selected as part of your plan.",
      faq: genericFaq("Skin Rejuvenation"),
    },
  },

  // ---------------- PMU & BEAUTY ----------------
  {
    name: "Eyebrow Microblading",
    slug: "eyebrow-microblading",
    category: "pmu",
    description:
      "A manual technique that deposits fine pigment strokes to enhance the appearance of eyebrows.",
    detail: {
      whatIsIt:
        "Eyebrow Microblading is a manual technique that deposits fine pigment strokes to create the appearance of natural brow hairs.",
      whoMayConsider:
        "Those looking to enhance the appearance of sparse or uneven eyebrows may consider a consultation.",
      whatToExpect:
        "The session includes shape mapping and discussion before pigment is applied using a fine manual tool.",
      journey:
        "A consultation to agree on shape and tone precedes the session, typically followed by a touch-up appointment.",
      aftercare:
        "Aftercare instructions for the brow area are provided following the session to support the healing process.",
      faq: genericFaq("Eyebrow Microblading"),
    },
  },
  {
    name: "Lip Tinting",
    slug: "lip-tinting",
    category: "pmu",
    description:
      "A semi-permanent technique used to enhance the natural colour and definition of the lips.",
    detail: {
      whatIsIt:
        "Lip Tinting is a semi-permanent makeup technique used to enhance the natural colour and outline of the lips.",
      whoMayConsider:
        "Individuals looking to enhance lip colour or definition may wish to discuss this during a consultation.",
      whatToExpect:
        "The session involves colour selection and discussion before the tinting technique is applied.",
      journey:
        "A consultation to agree on tone and outline precedes the session.",
      aftercare:
        "Aftercare instructions are provided to support healing and colour retention.",
      faq: genericFaq("Lip Tinting"),
    },
  },
  {
    name: "Micropigmentation",
    slug: "micropigmentation",
    category: "pmu",
    description:
      "A broad semi-permanent makeup technique used to enhance specific facial features.",
    detail: {
      whatIsIt:
        "Micropigmentation is a broad term for semi-permanent makeup techniques used to enhance specific facial features.",
      whoMayConsider:
        "Those interested in semi-permanent enhancement of a specific feature may wish to discuss options at a consultation.",
      whatToExpect:
        "A design and colour consultation precedes the technique itself.",
      journey:
        "Sessions are typically followed by a touch-up appointment to refine the final result.",
      aftercare:
        "Specific aftercare instructions are provided to support healing.",
      faq: genericFaq("Micropigmentation"),
    },
  },
  {
    name: "SMP",
    slug: "smp-pmu",
    category: "pmu",
    description:
      "Scalp Micropigmentation offered within the PMU category as a beauty-tattoo-adjacent technique.",
    detail: {
      whatIsIt:
        "Within the PMU category, SMP (Scalp Micropigmentation) is a beauty-tattoo-adjacent technique that deposits fine pigment into the scalp.",
      whoMayConsider:
        "Individuals looking for a way to visually address thinning areas may discuss SMP during a consultation.",
      whatToExpect:
        "The technique is applied over one or more sessions depending on the area and desired look.",
      journey:
        "A consultation establishes the desired look before a session plan is agreed.",
      aftercare:
        "Specific aftercare guidance for the scalp is provided following each session.",
      faq: genericFaq("SMP"),
    },
  },
];

export function getTreatmentBySlug(slug: string): Treatment | undefined {
  return treatments.find((t) => t.slug === slug);
}

export function getTreatmentsByCategory(category: TreatmentCategory): Treatment[] {
  return treatments.filter((t) => t.category === category);
}
