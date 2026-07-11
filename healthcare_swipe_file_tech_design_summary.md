# Healthcare Swipe File Tech + Design Summary

Updated to 100 websites. Added six marketer-useful website signals: CMS/platform, frontend framework, animation/motion tech, conversion tools, experimentation/personalization, and media/design style. Detection is based on live homepage HTML plus fallback notes for blocked sites.


## Healthcare industry
| Signal | Count |
|---|---:|
| Provider enablement / value-based care | 16 |
| AI / clinical automation | 16 |
| Data / interoperability / life sciences | 13 |
| Primary care / consumer care | 12 |
| Navigation / benefits / employer health | 11 |
| Mental health / behavioral health | 10 |
| Fertility / family health | 6 |
| Revenue cycle / admin workflow | 6 |
| Equity / specialty care enablement | 3 |
| Insurance / payer | 3 |
| Research / trials / matching | 2 |
| Workforce marketplace | 2 |

## CMS / platform
| Signal | Count |
|---|---:|
| Webflow | 35 |
| WordPress | 32 |
| HubSpot CMS | 11 |
| not detected | 11 |
| Sanity | 5 |
| Contentful | 4 |
| Prismic | 4 |
| Shopify | 2 |
| custom/headless likely | 2 |
| custom enterprise CMS likely | 2 |
| custom/headless commerce likely | 2 |
| Framer | 2 |
| Drupal | 1 |
| Storyblok | 1 |

## Frontend framework
| Signal | Count |
|---|---:|
| not detected | 63 |
| React | 22 |
| Next.js | 14 |
| unknown/manual | 6 |
| Angular | 2 |
| Gatsby | 2 |
| Vue/Nuxt | 1 |
| Astro | 1 |

## Animation / motion detected
| Signal | Count |
|---|---:|
| yes | 91 |
| no | 9 |

## Conversion/chat/form tools detected
| Signal | Count |
|---|---:|
| no | 51 |
| yes | 49 |

## Experimentation/personalization detected
| Signal | Count |
|---|---:|
| no | 76 |
| yes | 18 |
| unknown | 6 |

## Design/media style signal
| Signal | Count |
|---|---:|
| product UI / platform visuals; people / patient / clinician imagery; illustration / abstract graphics | 44 |
| product UI / platform visuals; people / patient / clinician imagery; illustration / abstract graphics; video or motion media | 28 |
| people / patient / clinician imagery; illustration / abstract graphics | 13 |
| people / patient / clinician imagery; illustration / abstract graphics; video or motion media | 7 |
| consumer brand, people-led, ecommerce/product merchandising | 2 |
| product UI / platform visuals; illustration / abstract graphics; video or motion media | 1 |
| people-led consumer health + product/program cards | 1 |
| editorial clinical authority + information architecture first | 1 |
| illustration / abstract graphics | 1 |
| consumer marketplace, search-led, provider/member segmentation | 1 |
| enterprise life-sciences, scientific visuals + resource-heavy | 1 |

## Ideas Added As Columns

- `cms_platform_detected`: What publishing/CMS foundation are healthcare brands using: WordPress, Webflow, HubSpot CMS, Contentful, Shopify, etc.? Useful for migration, speed, governance, and content ops conversations.
- `frontend_framework_detected`: What frontend stack signals show up: Next.js, React, Gatsby, Nuxt, etc.? Useful for understanding performance, scalability, and site-maintenance maturity.
- `animation_motion_detected / animation_motion_tech`: Are sites using motion, carousels, Lottie, GSAP, video, or WebGL? Useful for evaluating whether motion supports explanation or adds friction.
- `conversion_chat_forms_detected / conversion_tools_detected`: What conversion infrastructure is present: HubSpot forms, Marketo, Calendly, Intercom, Drift, Qualified, etc.? Useful for funnel and sales handoff analysis.
- `experimentation_personalization_detected / tools`: Are sites using experimentation, AB testing, or account-based personalization tools like VWO, Optimizely, Mutiny, Demandbase, 6sense, Clearbit? Useful for growth maturity.
- `design_media_style_signal`: What visual persuasion mode does the homepage lean on: product UI, people/patient imagery, abstract graphics, video/motion media? Useful for category-level creative patterns.

## Newly Added To Reach 100
- Zus Health: healthcare data/interoperability infrastructure.
- Healthie: EHR, practice management, and patient engagement platform.


## Caveats
- Tech-stack detection is homepage-HTML based. Server-side CMSs and scripts hidden behind consent managers may be undercounted.
- Design/media style is inferred from image alt text, filenames, classes, visible text, and video tags. Visual review of screenshots would tighten this further.
- The two newly added sites do not have Figma screenshot nodes in the original swipe file; they are marked as manually added.