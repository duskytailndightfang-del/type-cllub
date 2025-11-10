export const healthcareSampleTexts = {
  beginner: [
    "Patient care is the foundation of healthcare. Medical professionals must maintain accurate health records and communicate effectively with patients.",
    "Vital signs include temperature, pulse, respiration, and blood pressure. These measurements are essential for patient assessment.",
    "Medication administration requires proper documentation. Always verify patient identity and check for allergies before giving any medication.",
    "Hand hygiene is the most important infection control measure. Healthcare workers should wash hands before and after patient contact.",
    "Medical terminology uses prefixes and suffixes. Understanding these word parts helps in learning complex medical terms."
  ],
  intermediate: [
    "The cardiovascular system consists of the heart, blood vessels, and blood. The heart pumps oxygenated blood through arteries to body tissues and returns deoxygenated blood through veins.",
    "Diabetes mellitus is a chronic condition affecting glucose metabolism. Type 1 diabetes results from autoimmune destruction of pancreatic beta cells, while Type 2 involves insulin resistance.",
    "Aseptic technique prevents contamination during medical procedures. This includes sterile field preparation, proper gloving technique, and maintaining equipment sterility throughout the procedure.",
    "Pain assessment uses multiple scales including numeric rating, visual analog, and Wong-Baker faces scale. Documentation should include location, intensity, quality, and factors that relieve or worsen pain.",
    "Wound healing occurs in four overlapping phases: hemostasis, inflammation, proliferation, and remodeling. Proper wound care accelerates healing and prevents infection complications."
  ],
  advanced: [
    "Pharmacokinetics involves drug absorption, distribution, metabolism, and excretion. The hepatic first-pass effect significantly reduces bioavailability of orally administered medications, necessitating higher initial doses or alternative routes.",
    "Sepsis represents a dysregulated host response to infection causing life-threatening organ dysfunction. Early recognition through qSOFA criteria and prompt administration of broad-spectrum antibiotics within one hour significantly improves mortality outcomes.",
    "Mechanical ventilation modes include volume-controlled, pressure-controlled, and pressure support ventilation. Understanding the relationship between tidal volume, PEEP, FiO2, and lung compliance is crucial for preventing ventilator-induced lung injury.",
    "Electrocardiography interpretation requires systematic analysis of rate, rhythm, axis, intervals, and ST-segment morphology. Acute myocardial infarction presents with ST elevation in anatomically contiguous leads corresponding to specific coronary artery territories.",
    "Evidence-based practice integrates clinical expertise with the best available research evidence and patient values. Critical appraisal of randomized controlled trials involves assessing allocation concealment, intention-to-treat analysis, and statistical versus clinical significance."
  ]
};

export const healthcareAudioSentences = [
  "The patient presented with acute abdominal pain.",
  "Administer two milligrams of morphine intravenously.",
  "Blood pressure is one twenty over eighty millimeters of mercury.",
  "The surgical team will perform an appendectomy.",
  "Document all vital signs in the electronic health record.",
  "The patient has a known allergy to penicillin.",
  "Consult cardiology for chest pain evaluation.",
  "Order a complete blood count and metabolic panel.",
  "The wound shows signs of infection and inflammation.",
  "Implement fall precautions for this high-risk patient."
];

export const healthcareAudioParagraphs = [
  "Patient safety is paramount in healthcare delivery. All staff members must participate in creating a culture of safety by reporting near misses and adverse events. Root cause analysis helps identify system failures rather than blaming individuals. Implementing safety protocols, double-checking procedures, and maintaining open communication channels significantly reduces medical errors and improves patient outcomes.",
  "Infection control measures protect both patients and healthcare workers. Standard precautions apply to all patient interactions and include hand hygiene, personal protective equipment use, respiratory hygiene, and safe injection practices. Transmission-based precautions add extra protection for contact, droplet, or airborne infections. Environmental cleaning and proper waste disposal are essential components of infection prevention programs.",
  "Effective patient communication requires active listening, empathy, and cultural sensitivity. Healthcare providers should use plain language, avoid medical jargon, and employ teach-back methods to ensure understanding. Addressing health literacy barriers and providing written materials in multiple languages promotes patient engagement and adherence to treatment plans. Family involvement enhances care coordination and supports positive health outcomes."
];

export const getHealthcareSampleByLevel = (level: string): string => {
  const samples = healthcareSampleTexts[level as keyof typeof healthcareSampleTexts] || healthcareSampleTexts.beginner;
  return samples[Math.floor(Math.random() * samples.length)];
};

export const getHealthcareAudioSentence = (): string => {
  return healthcareAudioSentences[Math.floor(Math.random() * healthcareAudioSentences.length)];
};

export const getHealthcareAudioParagraph = (): string => {
  return healthcareAudioParagraphs[Math.floor(Math.random() * healthcareAudioParagraphs.length)];
};
