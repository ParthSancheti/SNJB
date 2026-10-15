const campaign = {
  '/images/orientation.webp': '/campaign/v8/orientation.webp',
  '/images/campus-life.webp': '/campaign/v8/campus-life.webp',
  '/images/computer-lab.webp': '/campaign/v8/computer-lab.webp',
  '/subjects/computer.webp': '/campaign/v8/subjects/computer.webp',
  '/subjects/data.webp': '/campaign/v8/subjects/data.webp',
  '/subjects/civil.webp': '/campaign/v8/subjects/civil.webp',
  '/subjects/electronics.webp': '/campaign/v8/subjects/electronics.webp',
  '/subjects/mechanical.webp': '/campaign/v8/subjects/mechanical.webp',
};
export const resolveDeliveryImage = path => campaign[path] || path;
export const isCampaignImage = path => Boolean(campaign[path]);
