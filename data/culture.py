DOMAIN = "Culture & Society"

CURRENT_STATE_CARDS = [
    {"label": "Avg Daily Social Media Time",  "value": "143 min", "delta": "First decline in 2026"},
    {"label": "Multigenerational Households", "value": "Record",  "delta": "#1 trend APAC"},
    {"label": "AI Content vs Human Content",  "value": "AI > 50%", "delta": "Crossed in 2025"},
    {"label": "Youth Mental Health Crisis",   "value": "All G7",  "delta": "Policy agenda 2026"},
]

TRENDS = [
    {
        "name":            "The Social Exit",
        "category":        "Digital Behavior",
        "confidence":      85,
        "impact":          80,
        "timeline":        "short",
        "short_forecast":  (
            "Social media time-on-platform falls for the first time after 12 years of growth. "
            "Major platforms face their first sustained user decline in Western markets in 2026."
        ),
        "medium_forecast": (
            "By 2027 the creator economy bifurcates: a premium tier of trusted human voices "
            "commands disproportionate value, while AI-generated commodity content races to zero."
        ),
    },
    {
        "name":            "Authenticity Premium",
        "category":        "Consumer Behavior",
        "confidence":      87,
        "impact":          82,
        "timeline":        "short",
        "short_forecast":  (
            "Nearly a third of consumers actively avoid brands using AI ads. Verified human "
            "creation, provenance signals, and 'real people' branding become competitive advantages."
        ),
        "medium_forecast": (
            "A 'meaning economy' emerges by 2027 where consumers pay a premium for verified "
            "human creation across content, commerce, and education at scale."
        ),
    },
    {
        "name":            "Digital Fatigue & Analog Revival",
        "category":        "Lifestyle",
        "confidence":      82,
        "impact":          70,
        "timeline":        "short",
        "short_forecast":  (
            "Analog hobbies (scrapbooking, crochet, reading groups), physical media (CDs, vinyl), "
            "and in-person events are trending as hedges against digital saturation in 2026."
        ),
        "medium_forecast": (
            "By 2027 the premium on physical, tangible, 'slow' experiences drives a "
            "measurable shift in leisure spending from digital subscriptions to real-world events."
        ),
    },
    {
        "name":            "Multigenerational Living",
        "category":        "Demographics",
        "confidence":      80,
        "impact":          75,
        "timeline":        "short",
        "short_forecast":  (
            "Multigenerational living rates hit record highs in Italy, Spain, Japan, and are "
            "rising in the US and UK. 'Home as multigenerational hub' is the #1 lifestyle trend in APAC."
        ),
        "medium_forecast": (
            "By 2028 housing policy, home design, and family financial planning industries "
            "structurally reorganize around multigenerational household norms."
        ),
    },
    {
        "name":            "Comfort Culture & Anti-Hustle",
        "category":        "Youth Culture",
        "confidence":      83,
        "impact":          68,
        "timeline":        "short",
        "short_forecast":  (
            "Young people romanticize rest as survival, not laziness. Soft textures, warm lighting, "
            "home rituals, and 'doing less' become core Gen Z/Alpha lifestyle priorities."
        ),
        "medium_forecast": (
            "By 2027 the four-day work week crosses a threshold of mainstream policy adoption "
            "in 4+ G7 nations, driven by productivity data and youth labor market demands."
        ),
    },
    {
        "name":            "AI-Society Renegotiation",
        "category":        "Technology & Society",
        "confidence":      84,
        "impact":          85,
        "timeline":        "short",
        "short_forecast":  (
            "2026 is the year society shifts from AI anxiety to AI partnership. "
            "Regulations on platform algorithmic transparency and age verification advance in EU."
        ),
        "medium_forecast": (
            "Youth mental health becomes a G7 policy crisis by 2027, driving regulatory action "
            "on platform design and algorithmic transparency as a public health measure."
        ),
    },
    {
        "name":            "Religion & Political Entanglement",
        "category":        "Politics & Society",
        "confidence":      78,
        "impact":          77,
        "timeline":        "short",
        "short_forecast":  (
            "Religious effervescence is co-mingling with political effervescence across both "
            "the far right and left globally. 'Other' religions up 1% in 5 years; retention "
            "rates highest in Islam, Hinduism, and Judaism."
        ),
        "medium_forecast": (
            "By 2028 religious and community affiliation (secular and traditional) replaces "
            "social platforms as the dominant 'identity container' for young adults."
        ),
    },
    {
        "name":            "Culture as Collective Therapy",
        "category":        "Arts & Experience Economy",
        "confidence":      76,
        "impact":          71,
        "timeline":        "short",
        "short_forecast":  (
            "Immersive, meaning-focused cultural experiences outperform traditional entertainment "
            "metrics in 2026: wellness exhibitions, multi-sensory readings, healing-centered events."
        ),
        "medium_forecast": (
            "By 2027 the experience economy is redefined around emotional depth and "
            "collective meaning — a $500B+ market shift from entertainment to 'experiential wellness'."
        ),
    },
    {
        "name":            "Geopolitical Cultural Fragmentation",
        "category":        "Geopolitics & Media",
        "confidence":      81,
        "impact":          83,
        "timeline":        "medium",
        "short_forecast":  (
            "Distinct AI ecosystems, media environments, and information landscapes form for "
            "US, EU, China, and Global South blocs. Shared global cultural references weaken."
        ),
        "medium_forecast": (
            "By 2028 citizens in different geopolitical blocs effectively inhabit distinct "
            "information realities, making cross-cultural diplomatic communication structurally harder."
        ),
    },
    {
        "name":            "Generational Divergence",
        "category":        "Demographics",
        "confidence":      86,
        "impact":          74,
        "timeline":        "short",
        "short_forecast":  (
            "Gen Alpha's chaos/absurdist TikTok culture, Millennial/Z comfort memes, and Gen X "
            "1980s nostalgia are completely disconnected cultural signals with no common thread."
        ),
        "medium_forecast": (
            "By 2027 the workforce contains five generations simultaneously, creating management, "
            "communication, and productivity challenges unlike any prior historical period."
        ),
    },
]

WILDCARDS = [
    {
        "title":       "AI Media Authenticity Panic",
        "description": (
            "A major AI-generated deepfake event (election interference, fabricated crisis "
            "footage) triggers a global 'authenticity panic', permanently fracturing content "
            "consumption norms and accelerating platform collapse."
        ),
        "risk_level": "high",
    },
    {
        "title":       "Social Platform Collapse",
        "description": (
            "The 'social exit' accelerates into genuine collapse for one major platform "
            "(TikTok ban/collapse, X fragmentation), forcing a rapid re-architecture of the "
            "attention economy with no clear successor."
        ),
        "risk_level": "medium",
    },
    {
        "title":       "Youth Mental Health Policy Emergency",
        "description": (
            "A documented teen mental health crisis in 2–3 G7 nations simultaneously triggers "
            "emergency legislative action on social media, including mandatory age gates, "
            "algorithmic audits, and platform liability for harm."
        ),
        "risk_level": "medium",
    },
]
