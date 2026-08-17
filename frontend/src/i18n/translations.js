/**
 * Jeevan Multi-Language Translation Dictionary
 * Supported Languages: English ('en'), Hindi ('hi')
 */

export const translations = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_request_blood: 'Request Blood',
    nav_my_donations: 'My Donations',
    nav_find_donors: 'Find Donors',
    nav_profile: 'Profile Settings',
    nav_logout: 'Logout',
    nav_login: 'Login',
    nav_register: 'Register',
    nav_live_active: 'Live: ACTIVE',
    nav_live_busy: 'Live: BUSY',

    // Hero Banner
    hero_title: 'Every Drop Counts. Save Lives in Real-Time.',
    hero_subtitle: 'AI-powered blood donation platform connecting emergency patients with eligible donors in seconds.',
    hero_create_request: 'Create Blood Request',
    hero_find_donors: 'Find Nearby Donors',

    // Home & Active Feed
    home_active_feed: 'Live Active Emergency Requests',
    home_no_requests: 'No active blood requests found at the moment.',
    home_contact_btn: 'Contact Requester',
    home_posted_by: 'Posted by',

    // Create Request Page
    create_req_title: 'Create Emergency Blood Request',
    create_req_sub: 'Submit details to instantly notify compatible nearby donors via AI matching and SMS alerts.',
    create_patient_name: 'Patient Name',
    create_patient_age: 'Patient Age',
    create_disease_reason: 'Medical Condition / Reason',
    create_hospital_location: 'Hospital Name & Full Address',
    create_units_req: 'Units Required',
    create_urgency_level: 'Urgency Level',
    create_submit_btn: 'Broadcast Emergency Alert',
    create_form_responsive_notice: '24/7 AI Proximity Matching & SMS Alerts Active',

    // My Donations Page
    donations_page_title: 'My Donations Activity',
    donations_page_sub: 'Track your responses, commitments, and blood donation history',
    donations_no_activities: 'No Donation Activities Yet',
    donations_no_activities_sub: 'When you respond to blood requests, all your donation activities will appear here.',
    donations_browse_btn: 'Browse Active Requests',

    // Dashboard Page
    dash_title: 'Donor Dashboard',
    dash_sub: 'Manage availability, track donor eligibility, and respond to AI-matched emergency requests.',
    dash_incoming_requests: 'Incoming Blood Requests',
    dash_ai_match_score: 'AI Match Score',

    // Impact Card & Gamification
    impact_title: 'Your Donation Streak & Impact',
    impact_subtitle: 'Tracking your life-saving contributions, countdown timer, and achievement badges.',
    impact_ready_today: 'Ready to Donate Today!',
    impact_eligible_in: 'Eligible in {days} days',
    impact_streak_label: 'Donation Streak',
    impact_donations_suffix: 'donations',
    impact_streak_sub: 'Active donor streak log',
    impact_lives_label: 'Lives Impacted',
    impact_lives_suffix: 'lives saved',
    impact_lives_sub: 'Based on 1 unit = 3 lives saved',
    impact_next_date_label: 'Next Donation Date',
    impact_eligible_now: 'Eligible Now',
    impact_no_waiting: 'No waiting period remaining',
    impact_days_rem: '{days} days remaining',
    impact_badges_title: 'Achievement Badges & Retention Rewards',

    // Badges
    badge_first_title: 'First Lifesaver',
    badge_first_desc: 'Completed 1st lifetime blood donation',
    badge_champ_title: 'Blood Champion',
    badge_champ_desc: 'Achieved 3+ lifetime blood donations',
    badge_master_title: 'Master Lifesaver',
    badge_master_desc: 'Achieved 5+ lifetime blood donations',
    badge_hero_title: 'Universal Hero',
    badge_hero_desc: 'O- or O+ High-Compatibility Donor',
    badge_verified_title: 'Verified Lifeline',
    badge_verified_desc: 'Mobile Verified & Preliminary Health Cleared',

    // Compatibility Chart
    chart_title: 'Interactive Blood Group Compatibility Guide',
    chart_subtitle: 'Select any blood group below to visualize who can donate to whom during emergency medical procedures.',
    chart_recipient_view: 'Recipient View',
    chart_donor_view: 'Donor View',
    chart_can_receive_from: 'Can RECEIVE Blood From:',
    chart_can_donate_to: 'Can DONATE Blood To:',

    // Common Buttons & Labels
    btn_submit: 'Submit',
    btn_cancel: 'Cancel',
    btn_save: 'Save',
    btn_loading: 'Loading...',
    label_blood_group: 'Blood Group',
    label_location: 'Location',
    label_units: 'Units Needed',
    label_urgency: 'Urgency Level'
  },

  hi: {
    // Navigation
    nav_home: 'होम',
    nav_dashboard: 'डैशबोर्ड',
    nav_request_blood: 'रक्त अनुरोध',
    nav_my_donations: 'मेरी रक्तदान गतिविधियां',
    nav_find_donors: 'रक्तदाता खोजें',
    nav_profile: 'प्रोफाइल सेटिंग्स',
    nav_logout: 'लॉगआउट',
    nav_login: 'लॉगिन',
    nav_register: 'पंजीकरण',
    nav_live_active: 'लाइव: उपलब्ध',
    nav_live_busy: 'लाइव: व्यस्त',

    // Hero Banner
    hero_title: 'हर बूंद कीमती है। वास्तविक समय में जानें बचाएं।',
    hero_subtitle: 'AI-संचालित रक्तदान मंच जो आपातकालीन मरीजों को पात्र रक्तदाताओं से सेकंडों में जोड़ता है।',
    hero_create_request: 'रक्त की मांग दर्ज करें',
    hero_find_donors: 'पास के रक्तदाता खोजें',

    // Home & Active Feed
    home_active_feed: 'सक्रिय आपातकालीन रक्त अनुरोध',
    home_no_requests: 'इस समय कोई सक्रिय रक्त अनुरोध नहीं मिला।',
    home_contact_btn: 'अनुरोधकर्ता से संपर्क करें',
    home_posted_by: 'द्वारा पोस्ट किया गया',

    // Create Request Page
    create_req_title: 'आपातकालीन रक्त मांग दर्ज करें',
    create_req_sub: 'विवरण दर्ज करें ताकि पास के अनुकूल रक्तदाताओं को AI और SMS द्वारा तुरंत सूचित किया जा सके।',
    create_patient_name: 'मरीज का नाम',
    create_patient_age: 'मरीज की उम्र',
    create_disease_reason: 'बीमारी का कारण / स्थिति',
    create_hospital_location: 'अस्पताल का नाम और पूरा पता',
    create_units_req: 'आवश्यक यूनिट्स',
    create_urgency_level: 'आपातकाल स्तर',
    create_submit_btn: 'आपातकालीन अलर्ट भेजें',
    create_form_responsive_notice: '24/7 AI निकटता मैचिंग और SMS अलर्ट सक्रिय',

    // My Donations Page
    donations_page_title: 'मेरी रक्तदान गतिविधियां',
    donations_page_sub: 'अपनी प्रतिक्रियाओं, प्रतिबद्धताओं और रक्तदान इतिहास को ट्रैक करें',
    donations_no_activities: 'अभी तक कोई रक्तदान गतिविधि नहीं',
    donations_no_activities_sub: 'जब आप रक्त अनुरोधों का जवाब देंगे, तो आपकी सभी रक्तदान गतिविधियां यहां दिखाई देंगी।',
    donations_browse_btn: 'सक्रिय अनुरोध देखें',

    // Dashboard Page
    dash_title: 'रक्तदाता डैशबोर्ड',
    dash_sub: 'अपनी उपलब्धता प्रबंधित करें, पात्रता ट्रैक करें और AI-मैच किए गए आपातकालीन अनुरोधों का जवाब दें।',
    dash_incoming_requests: 'प्राप्त आपातकालीन अनुरोध',
    dash_ai_match_score: 'AI मैच स्कोर',

    // Impact Card & Gamification
    impact_title: 'आपकी रक्तदान लड़ी और प्रभाव',
    impact_subtitle: 'आपके जीवन रक्षक योगदान, पात्रता उलटी गिनती और उपलब्धि बैज की निगरानी।',
    impact_ready_today: 'आज ही रक्तदान के लिए तैयार!',
    impact_eligible_in: '{days} दिनों में योग्य',
    impact_streak_label: 'रक्तदान लड़ी',
    impact_donations_suffix: 'रक्तदान',
    impact_streak_sub: 'सक्रिय रक्तदाता लड़ी रिकॉर्ड',
    impact_lives_label: 'बचाई गई संभावित जानें',
    impact_lives_suffix: 'जानें बचाईं',
    impact_lives_sub: '1 यूनिट = 3 जिंदगियों के आधार पर',
    impact_next_date_label: 'अगली रक्तदान तिथि',
    impact_eligible_now: 'अब योग्य',
    impact_no_waiting: 'कोई प्रतीक्षा अवधि नहीं शेष',
    impact_days_rem: '{days} दिन शेष',
    impact_badges_title: 'उपलब्धि बैज और पुरस्कार',

    // Badges
    badge_first_title: 'प्रथम जीवन रक्षक',
    badge_first_desc: 'पहला सफल रक्तदान पूरा किया',
    badge_champ_title: 'रक्त चैंपियन',
    badge_champ_desc: '3+ जीवन रक्षक रक्तदान पूरे किए',
    badge_master_title: 'मास्टर जीवन रक्षक',
    badge_master_desc: '5+ जीवन रक्षक रक्तदान पूरे किए',
    badge_hero_title: 'सर्वव्यापी नायक',
    badge_hero_desc: 'O- या O+ सार्वभौमिक रक्तदाता',
    badge_verified_title: 'सत्यापित जीवनरेखा',
    badge_verified_desc: 'मोबाइल सत्यापित और स्वास्थ्य जांच उत्तीर्ण',

    // Compatibility Chart
    chart_title: 'रक्त समूह अनुकूलता गाइड',
    chart_subtitle: 'आपातकालीन समय में कौन किसको रक्तदान कर सकता है, यह देखने के लिए नीचे दिए गए रक्त समूह पर क्लिक करें।',
    chart_recipient_view: 'प्राप्तकर्ता दृश्य',
    chart_donor_view: 'रक्तदाता दृश्य',
    chart_can_receive_from: 'इनसे रक्त प्राप्त कर सकते हैं:',
    chart_can_donate_to: 'इनको रक्तदान कर सकते हैं:',

    // Common Buttons & Labels
    btn_submit: 'सबमिट करें',
    btn_cancel: 'रद्द करें',
    btn_save: 'सुरक्षित करें',
    btn_loading: 'लोड हो रहा है...',
    label_blood_group: 'रक्त समूह',
    label_location: 'स्थान',
    label_units: 'आवश्यक यूनिट्स',
    label_urgency: 'आपातकाल स्तर'
  }
};
