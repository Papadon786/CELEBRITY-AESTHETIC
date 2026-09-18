export type TreatmentCategory = "skin" | "hair" | "aesthetics" | "pmu";

export type TreatmentSubCategory =
  | "hair-restoration"
  | "hair-transplant"
  | "hair-care"
  | "acne-scars"
  | "pigmentation"
  | "medi-facials"
  | "laser-hair-removal"
  | "anti-aging-injectables"
  | "pmu-beauty";

export interface Treatment {
  name: string;
  slug: string;
  category: TreatmentCategory;
  subCategory: TreatmentSubCategory;
  subCategoryLabel: string;
  description: string;
  featured?: boolean;
  badge?: string;
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
  hair: "Hair Treatments",
  skin: "Skin Care & Aesthetics",
  aesthetics: "Aesthetics",
  pmu: "PMU",
};

export const subCategoryLabels: Record<TreatmentSubCategory, string> = {
  "hair-restoration": "Hair Restoration (GFC, PRP, EXOSOME)",
  "hair-transplant": "Hair Transplant Specialities (22 Sub-Treatments)",
  "hair-care": "Scalp & General Hair Care",
  "acne-scars": "Acne & Scar Treatments",
  "pigmentation": "Pigmentation & Skin Brightening",
  "medi-facials": "Advanced Medi Facials",
  "laser-hair-removal": "Laser Hair Removal (US FDA Approved)",
  "anti-aging-injectables": "Clinical Aesthetics & Injectables",
  "pmu-beauty": "Permanent Makeup (PMU)",
};

export const treatments: Treatment[] = [
  {
    "name": "GFC \u2014 Growth Factor Concentrate Therapy",
    "slug": "advanced-gfc",
    "category": "hair",
    "subCategory": "hair-restoration",
    "subCategoryLabel": "Hair Restoration",
    "featured": true,
    "badge": "Specialty Protocol",
    "description": "Next-generation autologous growth factor therapy engineered to activate dormant hair follicles and accelerate natural hair regrowth.",
    "detail": {
      "whatIsIt": "Growth Factor Concentrate (GFC) is an advanced biological therapy derived directly from your own blood. Unlike traditional PRP, GFC undergoes specialized processing to isolate and concentrate essential growth factors\u2014including PDGF, VEGF, EGF, and IGF-1\u2014without red or white blood cells, delivering pure regenerative signaling to miniaturizing hair follicles.",
      "whoMayConsider": "Men and women facing early to moderate pattern hair loss (androgenetic alopecia), diffuse hair thinning, post-stress shedding (telogen effluvium), or those preparing for or maintaining hair transplant outcomes.",
      "whatToExpect": "A simple blood draw is processed in specialized GFC kits to harvest high-purity growth factors. The concentrate is micro-administered into the scalp with ultra-fine needles. The session takes approximately 45 minutes with minimal discomfort under topical numbing.",
      "journey": "A standard protocol consists of 3 to 4 sessions spaced 4 weeks apart. Visible reduction in hair fall is typically noted after 1-2 sessions, with increased strand thickness and density emerging over 3 to 6 months.",
      "aftercare": "Avoid washing your hair or strenuous sweating for 24 hours. Gentle scalp care and adherence to customized topical/nutritional regimens ensure prolonged follicular vitality.",
      "faq": [
        {
          "question": "How is GFC superior to standard PRP?",
          "answer": "GFC delivers a higher concentration of unhindered growth factors without cellular debris (RBCs/WBCs), resulting in zero clumping, higher biological potency, and significantly less post-procedure soreness."
        },
        {
          "question": "Is GFC safe?",
          "answer": "Yes, GFC is 100% autologous (sourced from your own blood) with zero synthetic additives, eliminating any risk of allergy or foreign body reaction."
        },
        {
          "question": "How soon will I see results?",
          "answer": "Hair shedding typically reduces within 3-4 weeks, followed by noticeable thickening and healthier follicular coverage after the second or third session."
        }
      ]
    }
  },
  {
    "name": "Advanced PRP \u2014 Platelet-Rich Plasma Therapy",
    "slug": "advanced-prp",
    "category": "hair",
    "subCategory": "hair-restoration",
    "subCategoryLabel": "Hair Restoration",
    "featured": true,
    "description": "Enriched autologous plasma rich in biological platelets to stimulate micro-vascular circulation and revive weakening hair roots.",
    "detail": {
      "whatIsIt": "Platelet-Rich Plasma (PRP) therapy utilizes the patient's own concentrated blood platelets, which naturally contain bioactive proteins and healing factors that nourish follicular stem cells and reverse follicular miniaturization.",
      "whoMayConsider": "Individuals experiencing receding hairlines, crown thinning, hormonal hair thinning, or thinning after acute lifestyle stress.",
      "whatToExpect": "A routine blood sample is centrifuged to separate plasma rich in platelets. Following scalp sanitization and topical anesthesia, the PRP is delivered with micro-fine insulin needles into affected zones.",
      "journey": "Typically planned as 4 to 6 sessions spaced one month apart, followed by seasonal maintenance sessions every 4-6 months.",
      "aftercare": "Keep the scalp clean and dry for 24 hours. Avoid chemical hair treatments, vigorous brushing, or intense workouts for two days.",
      "faq": [
        {
          "question": "Is PRP painful?",
          "answer": "Discomfort is minimal as we use pharmaceutical-grade topical numbing cream prior to micro-injections."
        },
        {
          "question": "Can PRP regrow dead hair follicles?",
          "answer": "PRP revitalizes dormant and miniaturized follicles; areas with complete long-term baldness (scarred follicles) are better addressed through hair transplantation."
        }
      ]
    }
  },
  {
    "name": "Exosome Hair Restoration Therapy",
    "slug": "exosomes",
    "category": "hair",
    "subCategory": "hair-restoration",
    "subCategoryLabel": "Hair Restoration",
    "featured": true,
    "badge": "Cutting-Edge Biotechnology",
    "description": "Breakthrough cellular vesicle therapy delivering thousands of bio-active signaling molecules, mRNA, and regenerative factors directly to hair stem cells.",
    "detail": {
      "whatIsIt": "Exosomes are tiny nano-sized extracellular vesicles that function as the cellular communication network in human tissue. In hair restoration, clinical-grade exosomes instruct dormant hair follicle cells to re-enter the anagen (growth) phase and promote neo-vascularization.",
      "whoMayConsider": "Patients with stubborn hair loss, advanced androgenetic alopecia, recalcitrant thinning, or individuals seeking the absolute cutting edge in non-surgical regenerative medicine.",
      "whatToExpect": "Exosome formulation is micro-channeled into target areas of the scalp with high-precision micro-injectors. The procedure is efficient, quick, and virtually painless with topical numbing.",
      "journey": "Remarkably potent, Exosome therapy often requires just 1 to 2 sessions spaced 3 months apart, followed by annual reviews.",
      "aftercare": "Refrain from washing hair for 24 hours. Normal styling and activity can be resumed the following day.",
      "faq": [
        {
          "question": "Why choose Exosomes over PRP?",
          "answer": "Exosomes contain up to 1000x the concentration of active signaling proteins compared to traditional PRP, providing faster, more robust cellular signaling without requiring large blood draws."
        },
        {
          "question": "Are exosomes ethically sourced and safe?",
          "answer": "Yes, Crown Celebrity Aesthetic only utilizes certified, laboratory-grade, rigorously purified exosome formulations adhering to international safety standards."
        }
      ]
    }
  },
  {
    "name": "Male Hair Transplant",
    "slug": "male-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "Artisan hairline and crown restoration for men utilizing modern follicular extraction and high-density implantation tailored to male facial proportions.",
    "detail": {
      "whatIsIt": "Male Hair Transplant is a permanent surgical procedure where healthy, DHT-resistant hair follicles from the donor area (back/sides of the head) are carefully extracted and meticulously implanted into thinning or bald zones (hairline, temples, mid-scalp, and crown).",
      "whoMayConsider": "Men experiencing Norwood Stage 2 through 6 hair loss, receding hairlines, or vertex balding with adequate donor hair reserves.",
      "whatToExpect": "Conducted under local anesthesia in a single-day procedure. Follicles are harvested with micro-punches and implanted with precision direction and angle to mimic natural male growth.",
      "journey": "Consultation and hairline mapping precede surgery. Transplanted hairs shed within 3-6 weeks (shock loss), followed by permanent new growth starting from month 3 and achieving full density at 9-12 months.",
      "aftercare": "Specialized sleeping posture, saline sprays, and prescribed gentle washing protocols are followed for the first 10 days.",
      "faq": [
        {
          "question": "Will the transplanted hair fall out again?",
          "answer": "Transplanted follicles are taken from the DHT-resistant zone and retain their genetic immunity, meaning they grow permanently for life."
        },
        {
          "question": "When can I return to work?",
          "answer": "Most patients return to desk jobs within 3 to 5 days, and resume light exercise after 14 days."
        }
      ]
    }
  },
  {
    "name": "Female Hair Transplant",
    "slug": "female-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "Specialized, no-shave or discrete donor transplantation designed for female hairline lowering and diffuse parting restoration.",
    "detail": {
      "whatIsIt": "Female Hair Transplant addresses Ludwig pattern thinning, wide partings, high foreheads, or traction alopecia. The technique preserves existing long hair through selective micro-harvesting without requiring a full head shave.",
      "whoMayConsider": "Women with widening part lines, thinning temple points, high foreheads, or scarring from trauma or cosmetic surgeries.",
      "whatToExpect": "Gentle micro-FUE or non-shaven extraction done under local anesthesia. Grafts are placed delicately around existing native hairs to create soft, feminine density.",
      "journey": "Full diagnostic trichoscopy evaluates donor stability. Growth begins progressively around 3-4 months, maturing into luscious, natural density by 12 months.",
      "aftercare": "Detailed wash techniques and delicate care guidelines are provided, with no visible external scarring.",
      "faq": [
        {
          "question": "Do I have to shave my head for female hair transplant?",
          "answer": "No. In most female procedures, only a discreet window in the donor zone is trimmed, easily hidden under your existing hair."
        },
        {
          "question": "Will it look natural?",
          "answer": "Our surgeons carefully select single-hair grafts for the leading edge to produce soft, feather-like, natural feminine hairlines."
        }
      ]
    }
  },
  {
    "name": "FUE Hair Transplant",
    "slug": "fue-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "Advanced Follicular Unit Extraction utilizing micro-motorized punches for zero linear scars, rapid healing, and supreme graft survival.",
    "detail": {
      "whatIsIt": "Follicular Unit Extraction (FUE) is the gold-standard minimally invasive hair transplant technique. Individual follicular units containing 1 to 4 hairs are harvested one by one using micro-punches (0.7mm–0.9mm), eliminating linear incisions and stitches.",
      "whoMayConsider": "Anyone seeking permanent hair restoration who prefers short hairstyles without visible linear scars, along with rapid post-operative recovery.",
      "whatToExpect": "Performed under comfortable local anesthesia. Extracted grafts are preserved in chilled holding solutions and implanted at natural follicular angles and orientations.",
      "journey": "Day 1 procedure followed by post-op wash on Day 3. Tiny micro-dots in the donor area heal completely within 5-7 days. New hair matures over 8 to 12 months.",
      "aftercare": "Avoid direct sun, strenuous exercise, and scratching for 10-14 days. Full aftercare kit and guidance provided.",
      "faq": [
        {
          "question": "Does FUE leave scars?",
          "answer": "FUE leaves tiny micro-dots (less than 1mm) that are virtually invisible even when hair is cropped very short."
        },
        {
          "question": "What is the graft survival rate?",
          "answer": "At Crown Celebrity Aesthetic, our gentle graft handling protocols achieve survival rates exceeding 90-95%."
        }
      ]
    }
  },
  {
    "name": "Hairline Reconstruction",
    "slug": "hairline-reconstruction",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "Architectural artistic redesign of the frontal hairline, recreating age-appropriate transitions, micro-irregularities, and natural temporal peaks.",
    "detail": {
      "whatIsIt": "Hairline Reconstruction is an ultra-artistic transplant procedure focused purely on designing and rebuilding the frontal hairline that frames the face. It requires precise single-hair graft feathering, macro and micro-irregularity design, and natural forward angulation.",
      "whoMayConsider": "Individuals whose hairlines have receded, matured unevenly, or who feel their natural hairline is disproportionately high.",
      "whatToExpect": "In-depth artistic consultation where facial symmetry, Golden Ratio proportions, and patient age are analyzed to map the new hairline before surgical execution.",
      "journey": "Once implanted, new hairs begin showing definition around month 4, creating an undetectable, youthful frame by month 9.",
      "aftercare": "Gentle front-edge cleansing and protection from compression or friction during the initial 10 days.",
      "faq": [
        {
          "question": "How do you prevent a 'pluggy' or doll-like hairline?",
          "answer": "We exclusively place fine single-hair follicular units along the transition zone with varied micro-angles, completely eliminating straight or abrupt lines."
        }
      ]
    }
  },
  {
    "name": "Beard Hair Transplant",
    "slug": "beard-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Creation of sharp, dense, and full beards, goaties, or cheek coverage using scalp or beard donor follicles.",
    "detail": {
      "whatIsIt": "Beard Hair Transplant uses FUE extraction from the back of the scalp or under the jawline to implant follicles into sparse cheek areas, patchy jawlines, or scars, creating a masculine, contoured beard.",
      "whoMayConsider": "Men with patchy, thin, or absent facial hair due to genetics, burns, trauma, or surgical scarring.",
      "whatToExpect": "Outpatient procedure under local anesthesia. Grafts are implanted at an acute flat angle (15-20 degrees) parallel to the facial skin to ensure the beard lies flat.",
      "journey": "Tiny crusts shed within 7-10 days. The new beard begins growing around 3 months, and can be shaved, groomed, and trimmed like natural beard hair from month 6.",
      "aftercare": "Keep the facial skin clean and dry for the first 5 days. Avoid shaving for 3-4 weeks as instructed by your surgeon.",
      "faq": [
        {
          "question": "Can I shave normally after a beard transplant?",
          "answer": "Yes! Once fully healed (after 4-6 weeks), the transplanted hairs behave just like natural facial hair and can be shaved with a razor or trimmed."
        }
      ]
    }
  },
  {
    "name": "Moustache Hair Transplant",
    "slug": "moustache-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Precise density enhancement and scar camouflage for the upper lip, sculpting full, symmetric moustaches.",
    "detail": {
      "whatIsIt": "A dedicated micro-transplant technique focused on the philtrum and upper lip region, restoring density, correcting asymmetry, or concealing cleft lip scars.",
      "whoMayConsider": "Men seeking greater thickness, defined shape, or scar concealment across the upper lip.",
      "whatToExpect": "Careful extraction of single and double hair grafts implanted at precise downward angles to match natural moustache flow.",
      "journey": "Rapid recovery in 7 days; permanent natural hair growth flourishes over 6-9 months.",
      "aftercare": "Soft diet for the first 48 hours to minimize excessive upper lip movement; daily gentle saline misting.",
      "faq": [
        {
          "question": "Can cleft lip scars be covered?",
          "answer": "Yes, hair transplantation into mature cleft or trauma scars has an excellent track record of disguising tissue irregularities."
        }
      ]
    }
  },
  {
    "name": "Eyebrow Reconstruction",
    "slug": "eyebrow-reconstruction",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Delicate micro-hair transplant creating full, defined, and architecturally shaped eyebrows for men and women.",
    "detail": {
      "whatIsIt": "Eyebrow Reconstruction involves transplanting ultra-fine single hair follicles (from behind the ear or nape) into the eyebrow contour at near-zero degree angles to recreate natural eyebrow arches.",
      "whoMayConsider": "Those with over-plucked brows, genetic thinning, alopecia, or scars through the eyebrow.",
      "whatToExpect": "Detailed artistic stencil design precedes delicate implantation of 150 to 350 micro-grafts per brow under local anesthesia.",
      "journey": "Redness subsides in 4-5 days. Transplanted hair retains scalp growth characteristics initially, so occasional trimming is recommended.",
      "aftercare": "Gentle cleansing, avoid rubbing or applying makeup on the brows for 10 days.",
      "faq": [
        {
          "question": "Do transplanted eyebrow hairs keep growing?",
          "answer": "Yes, because they are sourced from donor scalp hair, they will need occasional trimming every couple of weeks."
        }
      ]
    }
  },
  {
    "name": "Afro Hair Transplant",
    "slug": "afro-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Specialized extraction protocol accommodating tight curl patterns and curved sub-dermal root trajectories in Afro-textured hair.",
    "detail": {
      "whatIsIt": "Afro Hair Transplant requires specialized curved punches and bespoke extraction protocols because Afro-textured follicles curl both above and beneath the skin surface, requiring expert skill to avoid transection.",
      "whoMayConsider": "Individuals of African descent experiencing traction alopecia, male pattern baldness, or female diffuse thinning.",
      "whatToExpect": "Conducted with specialized hybrid/curved punch instruments under local anesthesia, ensuring maximum graft integrity.",
      "journey": "Heals exceptionally well with minimal pigmentation changes when handled by our experienced team.",
      "aftercare": "Specialized moisturizing aftercare protects tight curl retention and prevents keloid formation.",
      "faq": [
        {
          "question": "Why is Afro hair transplant more complex?",
          "answer": "The curl continues below the epidermis into the subcutaneous layer. Specialized punch geometry and gentler handling prevent follicle severance."
        }
      ]
    }
  },
  {
    "name": "Body Hair Transplant",
    "slug": "body-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Harvesting robust donor grafts from beard or chest areas to augment scalp density in patients with depleted scalp donor zones.",
    "detail": {
      "whatIsIt": "Body Hair Transplant (BHT) is an advanced technique where follicles from the beard (under-chin area) or chest are harvested to supply supplemental grafts when traditional occipital scalp donor areas are depleted.",
      "whoMayConsider": "Patients with high grade baldness (Norwood 6/7) or previous over-harvested procedures requiring extra graft volume.",
      "whatToExpect": "Beard follicles are extracted via micro-FUE. They are thicker and offer superb volume when placed into the mid-scalp and crown.",
      "journey": "Integrates seamlessly into native scalp hair, adapting its growth cycle over time.",
      "aftercare": "Minimal donor healing time (3-5 days on the beard area with zero visible marks).",
      "faq": [
        {
          "question": "Where does body donor hair come from?",
          "answer": "The sub-mandibular beard region is the preferred source because beard hair is robust, thick, and has high survival rates."
        }
      ]
    }
  },
  {
    "name": "Hair Transplant Repair",
    "slug": "hair-transplant-repair",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "badge": "Corrective Expertise",
    "description": "Corrective restoration resolving unnatural hairlines, poor density, wrong angles, or donor scarring from previous suboptimal procedures.",
    "detail": {
      "whatIsIt": "Corrective Hair Transplant is a specialized surgery aimed at fixing poorly executed prior transplants: extracting poorly angled or pluggy grafts, repairing scarring, and rebuilding a natural, refined hairline.",
      "whoMayConsider": "Anyone dissatisfied with a previous hair transplant performed elsewhere due to artificial hairline appearance, poor yield, or donor over-harvesting.",
      "whatToExpect": "A tailored strategy combining punch graft excision of misdirected hairs, recycling of extracted grafts, and artistic re-implantation.",
      "journey": "Emotional and physical transformation over 9-12 months as the unnatural look is replaced with aesthetic harmony.",
      "aftercare": "Close monitoring and supportive regenerative therapies (GFC/CBL) are usually incorporated to optimize compromised tissue.",
      "faq": [
        {
          "question": "Can a bad transplant truly be corrected?",
          "answer": "Yes. Through modern corrective techniques, misplaced grafts can be gently excised, redistributed, and camouflaged with natural single-hair graft feathering."
        }
      ]
    }
  },
  {
    "name": "Unshaven Hair Transplant",
    "slug": "unshaven-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "badge": "Zero Downtime Look",
    "description": "Discreet transplantation allowing patients to undergo procedure without shaving recipient or visible donor areas.",
    "detail": {
      "whatIsIt": "Unshaven FUE (U-FUE) is a luxury, discrete procedure where hair is preserved at full length in the recipient area and extracted from small concealable micro-bands in the donor zone.",
      "whoMayConsider": "Executives, public figures, celebrities, and professionals who require absolute privacy and cannot shave their heads for professional reasons.",
      "whatToExpect": "Meticulous single-graft extraction and precision implantation between existing long hairs.",
      "journey": "Zero telltale signs of surgery. You can return to public appearances and social commitments immediately.",
      "aftercare": "Specialized wash protocols keep existing hair tangle-free while protecting newly planted grafts.",
      "faq": [
        {
          "question": "Will anyone know I had a transplant?",
          "answer": "No. Your existing hair covers the treated zones from day one, offering complete discretion."
        }
      ]
    }
  },
  {
    "name": "Crown Hair Transplant (Vertex Restoration)",
    "slug": "crown-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "Restoration of the complex circular whorl pattern on the vertex/crown to achieve natural 360-degree coverage.",
    "detail": {
      "whatIsIt": "The crown (or vertex) has a unique spiral 'whorl' pattern where hair radiates outward in multiple directions. Crown Hair Transplant requires expert mathematical and aesthetic execution to recreate this natural vortex.",
      "whoMayConsider": "Individuals with thinning, bald spots, or expanding loss on the top/back of their head.",
      "whatToExpect": "Careful design of the center whorl pivot point, placing dense multi-hair units that expand outwards matching native angles.",
      "journey": "Crown areas have slightly thicker skin and slower vascular turnaround; full maturation takes between 10 to 14 months.",
      "aftercare": "Complementary GFC or medical therapy is recommended to preserve native hairs surrounding the crown.",
      "faq": [
        {
          "question": "Why does crown hair transplant take longer to mature?",
          "answer": "Blood circulation at the highest vertex point of the scalp is naturally slightly slower than the frontal hairline, meaning full density reveals around 12 months."
        }
      ]
    }
  },
  {
    "name": "Temple Hair Transplant",
    "slug": "temple-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Restoration of youthful temporal points and side angles that frame the eyes and facial profile.",
    "detail": {
      "whatIsIt": "Temporal peaks are the triangular projections of hair on either side of the forehead that frame the profile. Reconstructing temples restores youthful facial width and balance.",
      "whoMayConsider": "Clients whose temples have retreated backward, creating an excessively broad forehead appearance.",
      "whatToExpect": "Ultra-fine single hair grafts placed at razor-thin, flat angles pointing backward and downward.",
      "journey": "Rapid recovery in 5-7 days; sharp profile definition is restored as grafts mature.",
      "aftercare": "Delicate washing without side friction; avoid tight glasses or headbands for two weeks.",
      "faq": [
        {
          "question": "Why are temples important?",
          "answer": "Without temporal peaks, even a low hairline looks artificial. Restoring temples dramatically enhances youthful facial geometry."
        }
      ]
    }
  },
  {
    "name": "Burn Scar Hair Transplant",
    "slug": "burn-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Reconstructive transplantation into fibrotic scar tissue from burns or trauma, restoring confidence and coverage.",
    "detail": {
      "whatIsIt": "Reconstructive transplantation into cicatricial (scarred) scalp tissue resulting from thermal burns, radiation, or mechanical trauma.",
      "whoMayConsider": "Patients with localized or widespread bald patches caused by past burns, childhood accidents, or surgical scars.",
      "whatToExpect": "Often pre-conditioned with PRP/GFC to soften fibrous tissue and promote angiogenesis before grafting.",
      "journey": "Gradual density buildup; often performed in 1-2 conservative sessions to respect scar vascularity.",
      "aftercare": "Specialized antiseptic and moisturizing aftercare.",
      "faq": [
        {
          "question": "Can hair actually grow in burn scar tissue?",
          "answer": "Yes. With proper vascular evaluation and gentle micro-instrumentation, transplanted hairs can successfully take root and grow in scar tissue."
        }
      ]
    }
  },
  {
    "name": "Transgender Hair Transplant",
    "slug": "transgender-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "Gender-affirming hairline reshaping—feminizing high, M-shaped hairlines into soft rounded contours, or masculinizing temple angles.",
    "detail": {
      "whatIsIt": "Gender-affirmative hair restoration specializes in transforming the hairline silhouette. For MTF transitions, it rounds out square temple recessions into a soft, arched feminine hairline. For FTM transitions, it establishes square, masculine temporal angles.",
      "whoMayConsider": "Transgender and non-binary individuals seeking facial gender confirmation and harmonious aesthetic alignment.",
      "whatToExpect": "Detailed aesthetic consultation aligning with hormone replacement therapy timelines and facial feminization/masculinization goals.",
      "journey": "Life-affirming transformation providing natural, permanent hair framing that complements your true identity.",
      "aftercare": "Standard gentle FUE aftercare with ongoing clinical support.",
      "faq": [
        {
          "question": "Does hormone therapy affect the transplant?",
          "answer": "HRT often helps stabilize native hair, creating an ideal foundation for enduring transplant density."
        }
      ]
    }
  },
  {
    "name": "Maximum Density Hair Transplant",
    "slug": "maximum-density-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "description": "High-density dense-packing technique yielding 50–65+ follicular units per square centimeter for unmatched fullness.",
    "detail": {
      "whatIsIt": "Maximum Density Hair Transplant utilizes high-magnification stereomicroscopic graft dissection and dense-packing implantation techniques to achieve superior follicular counts per square centimeter.",
      "whoMayConsider": "Patients with localized thinning, high donor availability, or those who demand the thickest possible visual result in a single pass.",
      "whatToExpect": "High-precision sapphire or implanter blade incisions spaced meticulously without compromising local scalp perfusion.",
      "journey": "Rich, lush density begins emerging at 6 months, reaching maximum fullness at 12 months.",
      "aftercare": "Nutritional and biological support protocols maximize 100% graft yield.",
      "faq": [
        {
          "question": "What is dense packing?",
          "answer": "Dense packing is the art of placing 50-65+ follicular grafts per sq cm in suitable candidates, delivering maximum natural visual density."
        }
      ]
    }
  },
  {
    "name": "Natural Looking Hair Transplant",
    "slug": "natural-looking-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Master-level graft sorting, microscopic angulation, and organic distribution for completely undetectable hair restoration.",
    "detail": {
      "whatIsIt": "A philosophy and clinical protocol dedicated to ensuring that no one—even hair stylists up close—can detect that a hair transplant was performed.",
      "whoMayConsider": "Anyone who fears an artificial, tell-tale surgical look and prioritizes organic aesthetic perfection above all else.",
      "whatToExpect": "Every graft is sorted under high magnification into single, double, and triple hair units and placed according to nature's blueprint.",
      "journey": "Seamless integration with existing hair, natural growth direction, and invisible donor healing.",
      "aftercare": "Full standard aftercare guidance.",
      "faq": [
        {
          "question": "What makes a hair transplant look completely natural?",
          "answer": "Correct angulation (acute forward direction), single-hair soft transitions, subtle micro-irregularities, and age-appropriate design."
        }
      ]
    }
  },
  {
    "name": "Natural Hairline Transplant",
    "slug": "natural-hairline-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Customized facial contour framing with soft transitions and organic follicular irregularity.",
    "detail": {
      "whatIsIt": "Dedicated focus on the 1.5 cm frontal transition zone, recreating soft, feathered borders that match individual ethnicity, bone structure, and age.",
      "whoMayConsider": "Individuals seeking to reverse forehead recession without looking like they underwent cosmetic surgery.",
      "whatToExpect": "Handcrafted recipient sites created with ultra-thin blades followed by gentle micro-graft placement.",
      "journey": "Soft, natural framing is restored within 6 to 9 months.",
      "aftercare": "Gentle front-edge hygiene and sun protection.",
      "faq": [
        {
          "question": "Can I choose my own hairline height?",
          "answer": "We design the hairline collaboratively, balancing your personal preferences with anatomical aesthetic proportions."
        }
      ]
    }
  },
  {
    "name": "Minimal Pain Hair Transplant",
    "slug": "minimal-pain-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "badge": "Comfort First",
    "description": "Painless local anesthesia protocols, vibration anesthesia, and ultra-gentle micro-punches for a relaxing treatment experience.",
    "detail": {
      "whatIsIt": "Our Comfort-First protocol combines needleless jet-injection technology, buffered anesthetics, and acoustic vibration devices to virtually eliminate injection discomfort.",
      "whoMayConsider": "Patients with low pain tolerance or needle apprehension who have postponed hair restoration out of fear.",
      "whatToExpect": "You relax in our ergonomic surgical suite, listen to music or watch your favorite shows while our team cares for you comfortably.",
      "journey": "A calm, comfortable procedure day with zero trauma or anxiety.",
      "aftercare": "Comprehensive post-op analgesic guidance ensures you sleep soundly from night one.",
      "faq": [
        {
          "question": "Is the procedure really painless?",
          "answer": "Yes! Once local anesthesia is applied, patients feel zero pain and frequently doze off during the session."
        }
      ]
    }
  },
  {
    "name": "Minimal Scar Hair Transplant",
    "slug": "minimal-scar-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "description": "Sub-millimeter micro-FUE extraction that leaves virtually invisible micro-dots, allowing short fades and buzz cuts.",
    "detail": {
      "whatIsIt": "By using customized serrated trumpet punches measuring just 0.75mm to 0.85mm, extraction wounds close naturally within 48-72 hours with imperceptible micro-specks.",
      "whoMayConsider": "Men and women who love short fades, military cuts, or athletic lifestyles where scalp visibility is high.",
      "whatToExpect": "Rapid donor recovery with minimal crusting and zero stitch marks.",
      "journey": "Donor area looks pristine and unscarred within 7-10 days.",
      "aftercare": "Regenerative post-op healing ointments supplied by the clinic.",
      "faq": [
        {
          "question": "Can I wear a skin fade after this?",
          "answer": "Yes! The micro-extraction points heal so finely that short fade cuts remain crisp and clean."
        }
      ]
    }
  },
  {
    "name": "Cricketer Hair Transplant",
    "slug": "cricketer-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "badge": "Active Lifestyle Protocol",
    "description": "High-endurance hair restoration engineered for athletes, cricketers, and sports professionals exposed to helmets, sweat, and sunlight.",
    "detail": {
      "whatIsIt": "Designed specifically for sportsmen and active professionals. Addresses traction and friction from helmets, perspiration, and outdoor UV exposure while optimizing root anchor strength.",
      "whoMayConsider": "Cricketers, athletes, gym enthusiasts, and individuals with demanding outdoor physical lifestyles.",
      "whatToExpect": "Sturdy follicular units harvested from dense donor banks, implanted with reinforced root depth for durable longevity.",
      "journey": "Rapid recovery timeline allowing return to light conditioning in 7 days and full athletic competition in 3-4 weeks.",
      "aftercare": "Sports-specific sweat management and anti-friction scalp regimens.",
      "faq": [
        {
          "question": "When can I wear a cricket helmet or cap?",
          "answer": "Loose caps can be worn after 7-10 days; tight helmets are safely resumed after 3-4 weeks."
        }
      ]
    }
  },
  {
    "name": "Celebrity Hair Transplant",
    "slug": "celebrity-hair-transplant",
    "category": "hair",
    "subCategory": "hair-transplant",
    "subCategoryLabel": "Hair Transplant",
    "featured": true,
    "badge": "Signature VIP Service",
    "description": "Our signature red-carpet hair transplant protocol offering complete VIP privacy, high-definition camera-ready density, and rapid healing.",
    "detail": {
      "whatIsIt": "The flagship hair restoration protocol at Crown Celebrity Aesthetic. Combines luxury suite privacy, master surgeon execution, high-definition dense-packing, and optional non-shaven FUE for high-profile clients.",
      "whoMayConsider": "Actors, models, corporate leaders, and discerning clients who require absolute perfection, complete confidentiality, and camera-ready results.",
      "whatToExpect": "White-glove one-on-one attention throughout the day, customized gourmet catering, and state-of-the-art procedure suites.",
      "journey": "Seamless progression from confidential consultation to lush, photo-ready hair fullness that stands up to 4K studio cameras.",
      "aftercare": "VIP post-operative care package including hyperbaric/laser healing protocols and 24/7 direct doctor access.",
      "faq": [
        {
          "question": "Is confidentiality guaranteed?",
          "answer": "Yes, we maintain strict non-disclosure and private VIP entry/exit protocols for all high-profile clients."
        },
        {
          "question": "How soon will I look camera-ready?",
          "answer": "With our non-shaven and micro-implanter protocols, visible signs of surgery resolve in just days."
        }
      ]
    }
  },
  {
    "name": "Chemical Peels",
    "slug": "chemical-peels",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "featured": true,
    "description": "Medical-grade exfoliating peel solutions (Salicylic, Glycolic, TCA, Mandelic) targeting active acne, blemishes, and texture.",
    "detail": {
      "whatIsIt": "Chemical peels apply clinical dermatological solutions to accelerate cellular turnover, clear congested pores, dissolve dead skin build-up, and fade post-inflammatory marks.",
      "whoMayConsider": "Individuals dealing with active breakouts, blackheads, rough texture, or post-acne blemishes.",
      "whatToExpect": "Skin is cleansed and prepped before peel application. A mild tingling or warming sensation occurs for 3-5 minutes, followed by neutralizing and soothing balm.",
      "journey": "Planned as a series of 3 to 6 sessions spaced 2-4 weeks apart, customized in strength as your skin adapts.",
      "aftercare": "Strict sun protection (SPF 50+), hydration, and avoiding picking flaking skin.",
      "faq": [
        {
          "question": "Will my skin peel visibly?",
          "answer": "Depending on peel depth (mild fruit enzymes vs medium Jessner/TCA), peeling ranges from invisible microscopic shedding to light flaking for 3-4 days."
        }
      ]
    }
  },
  {
    "name": "Vampire Facial (PRP Microneedling)",
    "slug": "vampire-facial",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "description": "Clinical microneedling paired with autologous PRP to resurface textured skin and stimulate deep dermal regeneration.",
    "detail": {
      "whatIsIt": "The famed Vampire Facial pairs precision automated microneedling with pure platelet-rich plasma, creating micro-channels that drive biological growth factors deep into dermal tissue.",
      "whoMayConsider": "Individuals seeking dramatic improvement in skin firmness, pore size, acne scars, and overall vitality.",
      "whatToExpect": "Numbing cream ensures comfortable treatment. The automated micro-pen glides over skin while PRP is continuously infused.",
      "journey": "Best delivered as a 3-session program, resulting in luminous, firmer, smoother skin.",
      "aftercare": "Mineral sunscreen and gentle hyaluronic serum for 48 hours.",
      "faq": [
        {
          "question": "Is the Vampire Facial safe?",
          "answer": "Extremely safe because it uses only your own sterile autologous plasma with zero chemical synthetic additives."
        }
      ]
    }
  },
  {
    "name": "MNRF \u2014 Microneedling Radiofrequency",
    "slug": "mnrf",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "featured": true,
    "badge": "High-Tech Gold Standard",
    "description": "Gold-plated insulated micro-needles delivering controlled radiofrequency thermal energy into the dermis to remodel scars and tighten skin.",
    "detail": {
      "whatIsIt": "MNRF (Microneedling Radiofrequency) is our flagship device-based scar remodeling therapy. Insulated gold micro-needles penetrate the exact scar depth and deliver radiofrequency heat directly to the dermis, sparing the epidermis from thermal trauma.",
      "whoMayConsider": "Those with rolling, boxcar, or ice-pick acne scars, enlarged pores, skin laxity, or surgical scars.",
      "whatToExpect": "Topical numbing for 30-45 minutes. The computerized handpiece delivers precise stamping pulses across target zones.",
      "journey": "A standard course of 3 to 4 sessions spaced 4-6 weeks apart yields dramatic, permanent scar remodeling.",
      "aftercare": "Transient redness and micro-crusting for 2-3 days; soothing post-laser cream provided.",
      "faq": [
        {
          "question": "Is MNRF safe for dark or Indian skin?",
          "answer": "Yes! Because the RF energy is insulated and released only in the deep dermis, the surface melanocytes are protected, making it safe across all skin tones."
        }
      ]
    }
  },
  {
    "name": "Post-Pregnancy Stretch Mark Removal",
    "slug": "post-pregnancy-stretch-mark-removal",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "featured": true,
    "badge": "Poster Feature",
    "description": "Multi-modality protocol combining fractional laser, MNRF, and growth factors to fade stretch marks and restore skin elasticity.",
    "detail": {
      "whatIsIt": "Featured directly on our clinic poster wall ('Get Rid of Pregnancy Stretch Marks / Scars'), this clinical protocol targets red (striae rubra) and white (striae alba) stretch marks on the abdomen, hips, thighs, and arms.",
      "whoMayConsider": "Mothers and individuals with post-weight change or pregnancy stretch marks looking to restore smooth, firm abdominal texture.",
      "whatToExpect": "Combination of fractional laser resurfacing, microneedling RF, and peptide growth serum infusion.",
      "journey": "A series of 4 to 6 sessions spaced 4 weeks apart gradually restores skin color and tightens dermal elasticity.",
      "aftercare": "Moisturizing with medical-grade ceramides and protecting treated areas from direct sun.",
      "faq": [
        {
          "question": "Can old white stretch marks be treated?",
          "answer": "Yes! While early red marks respond fastest, our combination of MNRF and fractional laser effectively remodels mature white stretch marks."
        }
      ]
    }
  },
  {
    "name": "Clinical Acne Treatment",
    "slug": "acne-treatment",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "description": "Comprehensive diagnostic acne clearing protocol combining medical extractions, clarifying peels, and anti-inflammatory light therapy.",
    "detail": {
      "whatIsIt": "A multi-phase clinical treatment targeting the root causes of acne: excess sebum, bacterial overgrowth (C. acnes), hyperkeratinization, and inflammation.",
      "whoMayConsider": "Teens and adults struggling with persistent cystic acne, hormonal breakouts, whiteheads, or blackheads.",
      "whatToExpect": "Gentle ultrasonic skin cleansing, medical extractions of congested comedones, targeted clarifying peel, and blue light phototherapy.",
      "journey": "A targeted 4 to 8 week clearing phase followed by skin maintenance.",
      "aftercare": "Customized non-comedogenic homecare routine prescribed by our clinical aesthetician.",
      "faq": [
        {
          "question": "Will this cause breakouts initially?",
          "answer": "Some initial cellular purging can occur as congested pores clear, but inflammation quickly subsides into clear, calm skin."
        }
      ]
    }
  },
  {
    "name": "Acne Scar Treatment",
    "slug": "acne-scar-treatment",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "description": "Customized multi-layer scar restoration blending subcision, MNRF, chemical peels, and laser therapy.",
    "detail": {
      "whatIsIt": "A tailored clinical approach that categorizes scars by type (ice-pick, boxcar, rolling) and pairs each with the exact mechanism required for complete smoothing.",
      "whoMayConsider": "Anyone with residual textural scars from past acne breakouts.",
      "whatToExpect": "In-clinic assessment with 3D skin analysis followed by multi-modal procedure.",
      "journey": "Structured protocol across 3-5 sessions.",
      "aftercare": "Sun protection and restorative peptide balms.",
      "faq": [
        {
          "question": "Why use multiple techniques for acne scars?",
          "answer": "Different scar types exist at different depths; combining subcision for tethered scars with MNRF and peels delivers the smoothest finish."
        }
      ]
    }
  },
  {
    "name": "Scar Revision",
    "slug": "scar-revision",
    "category": "skin",
    "subCategory": "acne-scars",
    "subCategoryLabel": "Acne & Scar Treatments",
    "description": "Refinement and texture remodeling of surgical, traumatic, or post-injury scars.",
    "detail": {
      "whatIsIt": "Technique-driven protocol combining medical resurfacing, steroid micro-injections for keloids/hypertrophic scars, and fractional laser for optimal blending.",
      "whoMayConsider": "Individuals seeking to minimize the appearance of prominent scars from past surgery or injury.",
      "whatToExpect": "Assessment of scar maturity followed by personalized intervention.",
      "journey": "Sessions spaced 4-6 weeks apart.",
      "aftercare": "Silicone scar gel and UV protection.",
      "faq": [
        {
          "question": "Can scars be made completely invisible?",
          "answer": "While no scar can be 100% erased, our techniques soften, flatten, and blend scars so they become barely perceptible."
        }
      ]
    }
  },
  {
    "name": "Targeted Pigmentation Treatment",
    "slug": "pigmentation-treatment",
    "category": "skin",
    "subCategory": "pigmentation",
    "subCategoryLabel": "Pigmentation & Brightening",
    "featured": true,
    "badge": "Poster Protocol",
    "description": "Comprehensive clinical protocol combining lasers, chemical peels, microdermabrasion, and PRP to eliminate dark spots and uneven tone.",
    "detail": {
      "whatIsIt": "Featured on our 'No More Pigmentation' clinic poster, this protocol targets stubborn epidermal and dermal hyperpigmentation through a synergistic combination of Q-switch laser toning, peeling, and biological PRP.",
      "whoMayConsider": "Clients with sun spots, age spots, post-inflammatory hyperpigmentation (PIH), freckles, or patchy skin discoloration.",
      "whatToExpect": "Clinical examination under dermatological wood lamp followed by targeted laser pulses and clarifying serum application.",
      "journey": "A personalized course of 4 to 6 sessions spaced 2 to 3 weeks apart.",
      "aftercare": "Broad-spectrum SPF 50+ sunscreen and tyrosinase-inhibiting skincare serums.",
      "faq": [
        {
          "question": "Will the pigmentation return?",
          "answer": "With diligent daily sun protection and maintenance regimens, cleared pigmentation remains stable."
        }
      ]
    }
  },
  {
    "name": "Clinical Melasma Treatment",
    "slug": "melasma-treatment",
    "category": "skin",
    "subCategory": "pigmentation",
    "subCategoryLabel": "Pigmentation & Brightening",
    "featured": true,
    "description": "Gentle, non-heating pigment regulation therapy formulated to suppress deep hormonal melasma without rebound hyperpigmentation.",
    "detail": {
      "whatIsIt": "Melasma is a complex hormonal and UV-driven pigmentation disorder. Our clinic protocol utilizes low-fluence Q-switch laser toning, tranexamic acid mesotherapy, and depigmenting peels to safely break down pigment deposits without inducing heat rebound.",
      "whoMayConsider": "Women and men with symmetrical brownish patches across the forehead, cheeks, nose, or upper lip.",
      "whatToExpect": "Gentle, painless laser toning and cool soothing active masks.",
      "journey": "A gradual, patient 6 to 10 session protocol paired with specialized home maintenance.",
      "aftercare": "Strict avoidance of excessive heat, sauna, and direct sunlight; broad-spectrum mineral sunscreens.",
      "faq": [
        {
          "question": "Why is melasma treated differently from regular dark spots?",
          "answer": "Aggressive heat can trigger melasma to darken. Our conservative, low-fluence protocols gently disperse melanin while stabilizing hyperactive melanocytes."
        }
      ]
    }
  },
  {
    "name": "Skin Lightening & Tone Brightening",
    "slug": "skin-lightening",
    "category": "skin",
    "subCategory": "pigmentation",
    "subCategoryLabel": "Pigmentation & Brightening",
    "description": "Consultation-led clinical skin brightening combining botanical depigmenting actives, vitamin infusions, and laser glow.",
    "detail": {
      "whatIsIt": "A safe, ethical brightening program designed to reverse sun damage, tanning, and dullness, restoring your skin's natural luminous equilibrium.",
      "whoMayConsider": "Individuals dealing with heavy sun tan, pollution-induced dullness, or uneven facial and body tone.",
      "whatToExpect": "Customized clinical facials, peptide serums, and gentle pigment-clearing passes.",
      "journey": "Periodic review and progressive brightening over 4-6 visits.",
      "aftercare": "Diligent UV protection.",
      "faq": [
        {
          "question": "Are your lightening treatments safe and bleach-free?",
          "answer": "Yes, 100% bleach-free and steroid-free. We use only medically certified antioxidants, enzymes, and laser technology."
        }
      ]
    }
  },
  {
    "name": "IV Glutathione Antioxidant Therapy",
    "slug": "iv-glutathione",
    "category": "skin",
    "subCategory": "pigmentation",
    "subCategoryLabel": "Pigmentation & Brightening",
    "description": "Intravenous master antioxidant infusion delivering cellular detoxification, immunity support, and radiant skin clarity.",
    "detail": {
      "whatIsIt": "Glutathione is the body's master intracellular antioxidant. When administered intravenously alongside Vitamin C, it neutralizes free radicals, supports liver detoxification, and converts dark eumelanin into bright pheomelanin.",
      "whoMayConsider": "Individuals seeking systemic wellness, reduced oxidative stress, and enhanced full-body skin luminosity.",
      "whatToExpect": "A relaxing 30-minute IV drip administered by trained clinical nurses under medical supervision.",
      "journey": "Typically taken weekly for 6-8 weeks, followed by monthly maintenance.",
      "aftercare": "Drink plenty of water and maintain healthy lifestyle habits.",
      "faq": [
        {
          "question": "Why is IV Glutathione more effective than pills?",
          "answer": "Oral glutathione is largely degraded by digestive stomach acids; IV administration ensures 100% bioavailability directly into the bloodstream."
        }
      ]
    }
  },
  {
    "name": "Under-Eye Dark Circles Therapy",
    "slug": "under-eye-dark-circles",
    "category": "skin",
    "subCategory": "pigmentation",
    "subCategoryLabel": "Pigmentation & Brightening",
    "description": "Targeted peri-orbital rejuvenation resolving pigmentary, vascular, and hollow tear-trough dark circles.",
    "detail": {
      "whatIsIt": "Multi-factorial under-eye protocol addressing pigment deposition, thin translucent skin showing vascular blue tones, and structural volume loss.",
      "whoMayConsider": "Anyone looking tired due to persistent shadows, pigmentation, or hollows beneath the eyes.",
      "whatToExpect": "Gentle peri-orbital peels, carboxytherapy or micro-PRP, and optional tear-trough micro-fillers.",
      "journey": "Planned across 3 to 4 sessions for natural rejuvenation.",
      "aftercare": "Gentle eye cream and UV protection with sunglasses.",
      "faq": [
        {
          "question": "Will it get rid of hollow eyes?",
          "answer": "For hollow tear troughs, hyaluronic micro-fillers provide instant lifting, while PRP and peels clear pigment."
        }
      ]
    }
  },
  {
    "name": "Underarm Pigmentation Correction",
    "slug": "underarm-pigmentation",
    "category": "skin",
    "subCategory": "pigmentation",
    "subCategoryLabel": "Pigmentation & Brightening",
    "description": "Targeted Q-switch laser and specialized chemical peels to safely lighten dark, discolored underarms.",
    "detail": {
      "whatIsIt": "Specialized clinic protocol designed for sensitive flexural skin, eliminating dark underarm shadows caused by shaving friction, deodorants, or acanthosis nigricans.",
      "whoMayConsider": "Individuals conscious about wearing sleeveless clothing due to dark underarms.",
      "whatToExpect": "Quick 15-minute session combining gentle peeling and non-invasive laser toning.",
      "journey": "Typically 4 to 6 sessions spaced 2-3 weeks apart.",
      "aftercare": "Avoid alcohol-based deodorants and waxing during treatment.",
      "faq": [
        {
          "question": "Can laser hair removal be combined with underarm lightening?",
          "answer": "Yes! Combining diode laser hair removal with pigment peeling prevents recurring shaving irritation and speeds up lightening."
        }
      ]
    }
  },
  {
    "name": "HydraFacial Deep Cleansing & Infusion",
    "slug": "hydra-facial",
    "category": "skin",
    "subCategory": "medi-facials",
    "subCategoryLabel": "Advanced Medi Facials",
    "featured": true,
    "badge": "Poster Feature",
    "description": "Patented vortex vacuum cleansing, painless pore extractions, and antioxidant hydration infusion for an instant glow.",
    "detail": {
      "whatIsIt": "HydraFacial is a medical-grade hydra-dermabrasion device that executes a 4-step sequence: vortex cleansing, gentle acid peel exfoliation, painless suction extractions, and nutrient serum infusion (hyaluronic acid, antioxidants, peptides).",
      "whoMayConsider": "Everyone! Perfect for all skin types seeking instant glow, clean pores, and deep hydration.",
      "whatToExpect": "A deeply relaxing, refreshing 45-minute facial with zero discomfort or downtime.",
      "journey": "Enjoyed monthly for ongoing skin health or 2 days prior to any major event.",
      "aftercare": "Keep skin hydrated and protected with SPF 50+.",
      "faq": [
        {
          "question": "Can I do a HydraFacial before an event?",
          "answer": "Absolutely! It provides an immediate camera-ready, dewy radiance with zero redness."
        }
      ]
    }
  },
  {
    "name": "Carbon Laser Peel (Hollywood Laser Facial)",
    "slug": "carbon-laser-facial",
    "category": "skin",
    "subCategory": "medi-facials",
    "subCategoryLabel": "Advanced Medi Facials",
    "featured": true,
    "description": "Liquid carbon mask blasted with Q-switched laser to detoxify pores, reduce oiliness, and impart an instant porcelain glow.",
    "detail": {
      "whatIsIt": "A medical carbon lotion is applied across the face, penetrating deep into pores. As the Q-switched laser passes over, the carbon particles explode microscopically, vaporizing trapped sebum, dead cells, and bacteria.",
      "whoMayConsider": "Individuals with enlarged pores, oily skin, blackheads, or those wanting immediate celebrity-ready skin radiance.",
      "whatToExpect": "Slight clicking sound as the laser sweeps away the carbon. Completely painless and deeply satisfying.",
      "journey": "Can be performed every 3-4 weeks for clear, matte, pore-less skin.",
      "aftercare": "Gentle moisturizer and sunscreen.",
      "faq": [
        {
          "question": "Why is it called the Hollywood Facial?",
          "answer": "Celebrities frequently undergo this treatment immediately before red-carpet appearances because it provides an instant airbrushed glow with zero recovery."
        }
      ]
    }
  },
  {
    "name": "BB Glow Radiance Facial",
    "slug": "bb-glow-facial",
    "category": "skin",
    "subCategory": "medi-facials",
    "subCategoryLabel": "Advanced Medi Facials",
    "description": "Semi-permanent tinted peptide serum micro-infused into the epidermis to blur blemishes and impart a radiant CC-cream finish.",
    "detail": {
      "whatIsIt": "BB Glow is a semi-permanent makeup treatment that micro-infuses skin-colored pigment alongside peptides and niacinamide into the superficial stratum basale.",
      "whoMayConsider": "Those looking for a natural, semi-permanent tinted glow that reduces the need for daily foundation.",
      "whatToExpect": "Painless nano-needling infuses shade-matched serum into the skin.",
      "journey": "A series of 3 to 4 sessions provides coverage lasting 4 to 6 months.",
      "aftercare": "Avoid washing with hot water or scrubbing for 24 hours.",
      "faq": [
        {
          "question": "Will BB Glow clog my pores?",
          "answer": "No, our clinical formulations are non-comedogenic and infused with skin-loving vitamins and peptides."
        }
      ]
    }
  },
  {
    "name": "Laser Hair Removal \u2014 Men & Women",
    "slug": "laser-hair-removal",
    "category": "skin",
    "subCategory": "laser-hair-removal",
    "subCategoryLabel": "Laser Hair Removal (US FDA Approved)",
    "featured": true,
    "badge": "US FDA Approved",
    "description": "Gold-standard triple-wavelength diode laser with ice-cooling technology for virtually painless, permanent reduction of unwanted hair.",
    "detail": {
      "whatIsIt": "Featured on our 'No More Unwanted Hair' clinic poster with US FDA approval. Our advanced laser targets the melanin in active hair follicles, destroying the root and germinative cells to provide permanent hair reduction.",
      "whoMayConsider": "Men and women tired of shaving, waxing, ingrown hairs, and folliculitis on any body or facial area.",
      "whatToExpect": "The treatment area is shaved and chilled gel applied. The ice-cooled laser tip glides smoothly over the skin with minimal discomfort.",
      "journey": "Hair grows in cycles (anagen, catagen, telogen). A course of 6 to 8 sessions spaced 4-6 weeks apart catches each follicle in its active phase for permanent reduction.",
      "aftercare": "Avoid direct hot showers or sauna for 24 hours. Apply soothing aloe vera and SPF.",
      "faq": [
        {
          "question": "Is laser hair removal permanent?",
          "answer": "Yes, FDA-approved laser technology permanently disables treated hair follicles, delivering up to 90-95% long-term reduction."
        },
        {
          "question": "Does it hurt?",
          "answer": "Our state-of-the-art contact cooling chills the skin down to -5\u00b0C, making the sensation feel like a mild rubber band flick."
        }
      ]
    }
  },
  {
    "name": "Botox & Dynamic Wrinkle Softening",
    "slug": "botox",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "featured": true,
    "description": "Precision botulinum neurotoxin micro-injections to smooth forehead lines, crow's feet, and frown lines while preserving natural facial expressions.",
    "detail": {
      "whatIsIt": "Botox is a purified neurotoxin protein that temporarily relaxes hyperactive facial muscles responsible for dynamic expression wrinkles, leaving skin smooth and rested.",
      "whoMayConsider": "Adults noticing dynamic lines on the forehead, between the eyebrows (glabella), or around the eyes (crow's feet), or those seeking masseter slimming.",
      "whatToExpect": "Brief 15-minute appointment with micro-fine insulin needles. Discomfort is comparable to a quick pinprick.",
      "journey": "Smoothing begins within 3-4 days, reaching full elegance at 10-14 days and lasting 3 to 6 months.",
      "aftercare": "Remain upright for 4 hours; avoid rubbing the area or vigorous workouts for 24 hours.",
      "faq": [
        {
          "question": "Will my face look frozen?",
          "answer": "Never at Crown Celebrity Aesthetic. Our aesthetic physicians practice the 'baby Botox' approach, softening wrinkles while keeping your natural expressions alive."
        }
      ]
    }
  },
  {
    "name": "Dermal Fillers (Lips, Cheeks & Jawline)",
    "slug": "fillers",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "featured": true,
    "description": "Hyaluronic acid dermal fillers that sculpt facial contours, restore lost youthful volume, and define lips and jawlines.",
    "detail": {
      "whatIsIt": "Dermal fillers utilize biocompatible hyaluronic acid gel to restore lost volume, hydrate tissues from within, and enhance facial contours such as lips, cheeks, nasolabial folds, and chin.",
      "whoMayConsider": "Anyone experiencing volume loss, hollow under-eyes, thin lips, or recessed chin/jawlines.",
      "whatToExpect": "Topical numbing followed by precision micro-cannula or needle placement. Immediate visible results.",
      "journey": "Instant enhancement that integrates smoothly with facial tissues over 2 weeks, lasting 9 to 18 months depending on product choice.",
      "aftercare": "Mild swelling for 24-48 hours; avoid strenuous exercise and facial massage for 3 days.",
      "faq": [
        {
          "question": "Are hyaluronic acid fillers reversible?",
          "answer": "Yes! Hyaluronic acid fillers can be instantly dissolved using hyaluronidase enzyme if ever desired."
        }
      ]
    }
  },
  {
    "name": "HIFU Double Chin Reduction",
    "slug": "hifu-double-chin",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "description": "High-intensity focused ultrasound focused on the submental zone to melt focal fat and tighten sub-mandibular skin.",
    "detail": {
      "whatIsIt": "Focused ultrasound energy penetrates into the submental fat layer beneath the chin, producing targeted thermal coagulation that permanently reduces stubborn fat cells while tightening overlying loose skin.",
      "whoMayConsider": "Those with submental fullness ('double chin') or lack of jawline definition.",
      "whatToExpect": "30-minute non-surgical session with ultrasound gel.",
      "journey": "Progressive tightening and sharpening of the chin angle over 6-12 weeks.",
      "aftercare": "Zero downtime; resume regular activities immediately.",
      "faq": [
        {
          "question": "Is HIFU double chin permanent?",
          "answer": "Treated fat cells do not regenerate once destroyed; maintaining a stable weight preserves your sculpted jawline."
        }
      ]
    }
  },
  {
    "name": "Collagen Thread Lift Contouring",
    "slug": "thread-lift",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "description": "Dissolvable PDO/PLLA barbed threads that mechanically lift sagging jowls and cheeks while stimulating long-term collagen.",
    "detail": {
      "whatIsIt": "A minimally invasive contouring procedure where medical-grade polydioxanone (PDO) threads with micro-barbs are inserted beneath the skin to immediately reposition sagging tissues.",
      "whoMayConsider": "Clients with mild to moderate facial laxity, marionette lines, or sagging cheeks seeking a noticeable lift without surgical incisions.",
      "whatToExpect": "Performed under local anesthesia. The threads are placed via blunt micro-cannula with zero scalpels or visible cuts.",
      "journey": "Immediate mechanical lift with ongoing collagen remodeling over 12-18 months as the threads dissolve naturally.",
      "aftercare": "Avoid wide yawning, dental work, or vigorous facial massage for 2 weeks.",
      "faq": [
        {
          "question": "Are the threads visible or felt?",
          "answer": "No. The threads reside in the deep subdermal plane and dissolve safely over 6-9 months, leaving a scaffold of fresh collagen."
        }
      ]
    }
  },
  {
    "name": "MNRF Facial Skin Tightening",
    "slug": "mnrf-aesthetics",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "description": "Aesthetic microneedling radiofrequency for tightening facial skin laxity, fine lines, and open pores.",
    "detail": {
      "whatIsIt": "Targeted radiofrequency energy delivered via insulated micro-needles to stimulate deep neocollagenesis and tighten loose facial skin.",
      "whoMayConsider": "Those with skin laxity, enlarged pores, and fine lines seeking non-surgical tightening.",
      "whatToExpect": "Topical numbing for 30 minutes followed by precision stamping.",
      "journey": "3 sessions spaced 4 weeks apart.",
      "aftercare": "Mild redness resolves in 24 hours; daily SPF mandatory.",
      "faq": [
        {
          "question": "How quickly do tightening results appear?",
          "answer": "Initial tightening is felt within 2 weeks, with structural collagen strengthening over 3 months."
        }
      ]
    }
  },
  {
    "name": "Carbon Laser Aesthetic Glow",
    "slug": "carbon-laser-facial-aesthetics",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "description": "Aesthetic laser facial for instant clarity, refining skin tone and texture before high-profile events.",
    "detail": {
      "whatIsIt": "Application of carbon cream blasted with Q-switch laser pulses for instant radiance.",
      "whoMayConsider": "Anyone wanting an airbrushed, glowing complexion with zero downtime.",
      "whatToExpect": "Comfortable 25-minute treatment.",
      "journey": "Ideal monthly maintenance.",
      "aftercare": "Moisturizer and sunscreen.",
      "faq": [
        {
          "question": "Can I wear makeup after?",
          "answer": "Yes, makeup glides on flawlessly after carbon laser treatment."
        }
      ]
    }
  },
  {
    "name": "Comprehensive Skin Rejuvenation",
    "slug": "skin-rejuvenation",
    "category": "skin",
    "subCategory": "anti-aging-injectables",
    "subCategoryLabel": "Clinical Aesthetics & Injectables",
    "description": "Bespoke holistic anti-aging protocol harmonizing lasers, peels, and bio-nutrients.",
    "detail": {
      "whatIsIt": "A tailored combination protocol addressing multiple signs of aging simultaneously.",
      "whoMayConsider": "Clients looking for a structured, physician-guided aesthetic refresh.",
      "whatToExpect": "Holistic assessment and personalized session roadmap.",
      "journey": "Monitored across 3 to 6 visits.",
      "aftercare": "Personalized home regimen.",
      "faq": [
        {
          "question": "How do I know which treatments to choose?",
          "answer": "Our clinical practitioners conduct an in-depth facial analysis during your consultation to map your ideal combination."
        }
      ]
    }
  },
  {
    "name": "Eyebrow Microblading & Microshading",
    "slug": "eyebrow-microblading",
    "category": "pmu",
    "subCategory": "pmu-beauty",
    "subCategoryLabel": "Permanent Makeup (PMU)",
    "featured": true,
    "description": "Artisan hand-drawn hair strokes combined with soft powder shading to create hyper-realistic, natural eyebrows.",
    "detail": {
      "whatIsIt": "Eyebrow Microblading is a semi-permanent cosmetic tattooing technique where medical-grade pigments are deposited into the superficial dermis using fine micro-blades, creating realistic, individual brow hairs.",
      "whoMayConsider": "Those with sparse, over-plucked, asymmetric, or light eyebrows wanting effortless, daily brow perfection.",
      "whatToExpect": "Precise facial mapping and symmetry outline are agreed upon before numbing and pigment application.",
      "journey": "Initial 2-hour session followed by a perfecting touch-up appointment at 4 to 6 weeks. Results last 12 to 24 months.",
      "aftercare": "Keep brows dry for 7 days; apply prescribed healing balm.",
      "faq": [
        {
          "question": "Does microblading look natural?",
          "answer": "Yes! We match pigment shades to your natural hair and complexion, drawing individual hair strokes that blend imperceptibly."
        }
      ]
    }
  },
  {
    "name": "Semi-Permanent Lip Tinting (Lip Blush)",
    "slug": "lip-tinting",
    "category": "pmu",
    "subCategory": "pmu-beauty",
    "subCategoryLabel": "Permanent Makeup (PMU)",
    "featured": true,
    "description": "Soft watercolor pigment wash that defines lip borders, corrects pale or dark lip tones, and delivers a natural flushed tint.",
    "detail": {
      "whatIsIt": "Lip Blush is a semi-permanent micropigmentation technique that infuses a gentle, natural wash of custom-blended pigment into the lips, enhancing shape, symmetry, and color without heavy lipstick lines.",
      "whoMayConsider": "Anyone with pale lips, dark lip pigmentation, uneven borders, or those wanting a fresh tinted flush 24/7.",
      "whatToExpect": "Shade selection and lip pre-numbing for 25 minutes. Soft rotary micropigmentation ensures minimal sensation.",
      "journey": "Initial vibrant color softens by 40-50% over 5-7 days, revealing a luscious natural blush lasting 2 to 3 years.",
      "aftercare": "Keep lips moisturized with barrier balm; avoid spicy or citrus foods for 48 hours.",
      "faq": [
        {
          "question": "Can dark or hyperpigmented lips be treated?",
          "answer": "Yes! We specialize in dark lip neutralization, using warm balancing pigments to neutralize cool tones before adding your desired shade."
        }
      ]
    }
  },
  {
    "name": "Clinical Aesthetic Micropigmentation",
    "slug": "micropigmentation",
    "category": "pmu",
    "subCategory": "pmu-beauty",
    "subCategoryLabel": "Permanent Makeup (PMU)",
    "description": "Medical-grade cosmetic micropigmentation for eyeliner, beauty marks, and corrective camouflage.",
    "detail": {
      "whatIsIt": "High-precision digital machine micropigmentation for permanent eyeliner, lash enhancement, and aesthetic camouflage.",
      "whoMayConsider": "Clients wanting smudge-proof lash line enhancement or aesthetic feature definition.",
      "whatToExpect": "Sterile, comfortable procedure using single-use cartridge needles.",
      "journey": "Long-lasting results for 2-3 years.",
      "aftercare": "Dry healing for 5 days; gentle cleansing.",
      "faq": [
        {
          "question": "Is it safe around the eyes?",
          "answer": "Our PMU master artists are certified with extensive training in peri-ocular safety and hygiene."
        }
      ]
    }
  },
  {
    "name": "Scalp Micropigmentation (SMP Hair & Aesthetics)",
    "slug": "smp-hair",
    "category": "hair",
    "subCategory": "hair-care",
    "subCategoryLabel": "Scalp & General Hair Care",
    "featured": true,
    "badge": "Instant Density",
    "description": "Medical scalp tattooing creating the illusion of hair follicles, buzz-cut density, or camouflaging transplant scars.",
    "detail": {
      "whatIsIt": "Scalp Micropigmentation (SMP) deposits organic carbon-based micro-pigment specks into the upper dermis of the scalp, flawlessly replicating the appearance of shaved hair follicles or adding visual density to thinning hair.",
      "whoMayConsider": "Men with complete baldness wanting a clean buzz-cut look, women with visible scalp parting, or clients concealing FUE/FUT transplant scars.",
      "whatToExpect": "Mapping the hairline followed by micro-dot pigment deposition. Mild sensation with zero anesthesia required.",
      "journey": "Completed over 2 to 3 sessions to build depth and 3D layering, lasting 3 to 5 years.",
      "aftercare": "Avoid washing scalp for 4 days; protect from direct sun.",
      "faq": [
        {
          "question": "Will the pigment turn blue or green over time?",
          "answer": "No. We exclusively use specialized carbon-black SMP pigments that do not contain heavy metals or blue-green undertones, fading true to tone."
        }
      ]
    }
  },
  {
    "name": "Scalp Micropigmentation (PMU Aesthetics)",
    "slug": "smp-pmu",
    "category": "pmu",
    "subCategory": "pmu-beauty",
    "subCategoryLabel": "Permanent Makeup (PMU)",
    "description": "Aesthetic SMP services offered through our PMU academy wing for scalp hairline shading and scar camouflage.",
    "detail": {
      "whatIsIt": "Scalp Micropigmentation provided under our PMU Services & Academy division, providing artistic scalp density enhancement and corrective work.",
      "whoMayConsider": "Those exploring beauty-adjacent scalp shading, parting camouflage, or hairline micro-dots.",
      "whatToExpect": "Detailed mapping, color matching, and delicate multi-session micro-pigmentation.",
      "journey": "Structured across 2-3 visits.",
      "aftercare": "Gentle scalp hygiene and UV care.",
      "faq": [
        {
          "question": "How long does SMP last?",
          "answer": "Typically 3 to 5 years, with occasional touch-ups to refresh tone and sharpness."
        }
      ]
    }
  },
  {
    "name": "Non-Surgical Hair Patch",
    "slug": "hair-patch",
    "category": "hair",
    "subCategory": "hair-care",
    "subCategoryLabel": "Scalp & General Hair Care",
    "description": "Custom-designed, 100% natural human hair systems tailored to your hair texture, color, and scalp contour.",
    "detail": {
      "whatIsIt": "A premium non-surgical hair replacement system made from 100% Remy natural human hair mounted on breathable micro-mesh, providing instant full-head density.",
      "whoMayConsider": "Individuals who are not candidates for surgery, or who desire immediate thick hair without surgery or wait times.",
      "whatToExpect": "Custom scalp measurement, color matching, fitting, and professional hair styling.",
      "journey": "Immediate same-day transformation; maintenance every 3-4 weeks.",
      "aftercare": "Standard hair washing and conditioner routines.",
      "faq": [
        {
          "question": "Can I swim and shower with a hair patch?",
          "answer": "Yes! Modern medical adhesives and breathable bases allow you to swim, shower, workout, and style hair normally."
        }
      ]
    }
  },
  {
    "name": "Scalp & Dandruff Clinical Treatment",
    "slug": "dandruff-treatment",
    "category": "hair",
    "subCategory": "hair-care",
    "subCategoryLabel": "Scalp & General Hair Care",
    "description": "Medical scalp detox targeting Malassezia yeast, flaking, seborrheic dermatitis, and chronic scalp irritation.",
    "detail": {
      "whatIsIt": "Clinical scalp treatment combining salicylic clarifying exfoliation, high-frequency anti-fungal ozone therapy, and therapeutic anti-dandruff peptide infusions.",
      "whoMayConsider": "Anyone suffering from stubborn dandruff, flaky scalp, itching, or oily seborrhea.",
      "whatToExpect": "Deep scalp exfoliation, vacuum debris removal, and soothing clinical anti-fungal serum application.",
      "journey": "A series of 3 to 4 sessions spaced bi-weekly restores balanced scalp microbiome.",
      "aftercare": "Prescribed medical maintenance shampoo.",
      "faq": [
        {
          "question": "Will dandruff treatment stop hair fall?",
          "answer": "Yes! By eliminating scalp inflammation and unclogging follicular roots, hair shedding is significantly reduced."
        }
      ]
    }
  },
  {
    "name": "Hairfall Diagnostic & Care",
    "slug": "hairfall-treatment",
    "category": "hair",
    "subCategory": "hair-care",
    "subCategoryLabel": "Scalp & General Hair Care",
    "description": "Comprehensive trichological analysis, scalp micro-imaging, and personalized medical hair stabilization.",
    "detail": {
      "whatIsIt": "Digital trichoscopy and medical evaluation diagnosing the underlying causes of hair loss (hormonal, nutritional, autoimmune, stress).",
      "whoMayConsider": "Anyone noticing increased hair fall in the shower or on pillows, or early widening partings.",
      "whatToExpect": "High-magnification camera inspection of hair follicle density, shaft caliber, and scalp health followed by a tailored prescription.",
      "journey": "Structured medical protocol reviewed quarterly.",
      "aftercare": "Daily adherence to customized hair care.",
      "faq": [
        {
          "question": "What happens during a hairfall consultation?",
          "answer": "We examine your scalp under 200x digital magnification, evaluate bloodwork/lifestyle factors, and prescribe an exact restorative roadmap."
        }
      ]
    }
  }
];

export function getTreatmentBySlug(slug: string): Treatment | undefined {
  return treatments.find((t) => t.slug === slug);
}

export function getTreatmentsByCategory(category: TreatmentCategory): Treatment[] {
  return treatments.filter((t) => t.category === category);
}

export function getTreatmentsBySubCategory(subCategory: TreatmentSubCategory): Treatment[] {
  return treatments.filter((t) => t.subCategory === subCategory);
}
