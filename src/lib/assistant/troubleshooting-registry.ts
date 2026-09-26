import type { TroubleshootingEntry } from "./types";

/** Diagnostic entries, matched only when the query also carries "something's wrong"
 * framing (see hasProblemFraming in intent-matcher.ts). Every checklist item and fix
 * here reflects verified, current Webriiz behavior - see each entry's inline note for
 * where that was confirmed. Nothing here is guessed. */
export const TROUBLESHOOTING_REGISTRY: TroubleshootingEntry[] = [
  {
    id: "whatsapp_button_missing",
    title: "WhatsApp Button Not Showing on Storefront",
    keywords: ["whatsapp button", "whatsapp nahi aa raha", "whatsapp show nahi", "whatsapp missing", "chat button nahi"],
    symptomUrdu: "Storefront par WhatsApp chat button nazar nahi aa raha.",
    symptomEnglish: "The floating WhatsApp chat button isn't showing on the storefront.",
    checklist: [
      { urdu: "Settings → WhatsApp mein 'Show floating WhatsApp widget' toggle enabled hai?", english: "Is 'Show floating WhatsApp widget' enabled under Settings → WhatsApp?" },
      { urdu: "Ek WhatsApp Number (digits only, country code ke sath, jaise 923001234567) enter kiya gaya hai?", english: "Is a WhatsApp number entered (digits only, with country code, e.g. 923001234567)?" },
      { urdu: "Settings screen par Save Changes button dabaya gaya tha?", english: "Was Save Changes actually clicked after entering the number?" },
    ],
    fixUrdu:
      "Enabled + number dono zaroori hain - agar enabled hai lekin number khali hai to button jaan boojh kar hide rehta hai (koi fake number nahi dikhaya jata). Number enter karke Save karein, phir storefront refresh karke check karein.",
    fixEnglish:
      "Both must be true - enabled AND a number set. If enabled with no number, the button is deliberately hidden (no fake contact info is ever shown). Enter the number, Save, then refresh the storefront.",
    route: "/admin/settings",
    actionLabel: "Open WhatsApp Settings",
    exampleQuestions: ["WhatsApp button storefront par kyun nahi aa raha?", "Why isn't the WhatsApp button showing?"],
  },
  {
    id: "product_not_appearing",
    title: "Product Not Appearing on Storefront",
    keywords: ["product nahi dikh raha", "product not showing", "product missing storefront", "product nazar nahi aa raha", "product showing", "new product showing"],
    symptomUrdu: "Naya product save kiya lekin storefront par nazar nahi aa raha.",
    symptomEnglish: "A newly saved product isn't showing on the storefront.",
    checklist: [
      { urdu: "Product ka Status 'Active (published)' hai, ya 'Draft' par set hai? (naye products default 'Draft' se shuru hote hain)", english: "Is the product's Status set to 'Active (published)', or still 'Draft'? (new products default to Draft)" },
      { urdu: "Product ki stock quantity 0 to nahi hai (agar Out-of-stock behavior 'hide' set hai)?", english: "Is stock quantity above 0 (if Out-of-stock behavior is set to 'hide')?" },
      { urdu: "Product kisi category se assign hai, agar storefront category page se dhoond rahe hain?", english: "Is the product assigned to a category, if you're looking on a category page?" },
    ],
    fixUrdu:
      "Sab se aam wajah: naye products 'Draft' status ke sath banty hain, jo jaan boojh kar storefront par invisible rehta hai jab tak aap use Products → Edit → Status mein 'Active' na karein aur Save na karein.",
    fixEnglish:
      "Most common cause: new products are created with status 'Draft', which is deliberately invisible on the storefront until you edit the product, set Status to 'Active', and Save.",
    route: "/admin/products",
    actionLabel: "Open Products",
    exampleQuestions: ["Product storefront par nahi dikh raha", "Why isn't my new product showing up?"],
  },
  {
    id: "image_not_showing",
    title: "Product/Banner Image Not Showing",
    keywords: ["image nahi dikh rahi", "image not showing", "photo nahi aa rahi", "picture missing", "image broken"],
    symptomUrdu: "Upload ki hui image storefront ya admin par nazar nahi aa rahi.",
    symptomEnglish: "An uploaded image isn't displaying on the storefront or in admin.",
    checklist: [
      { urdu: "Upload process (Product Edit screen ke ImageUploader) fully complete ho chuka tha, error toast to nahi aya?", english: "Did the upload (via the ImageUploader on the Product Edit screen) fully finish without an error toast?" },
      { urdu: "Product/section Save kiya gaya tha upload ke baad?", english: "Was Save clicked after the upload finished?" },
      { urdu: "Agar branding logo/favicon hai, kya 'Logo URL' field mein ek theek image URL paste kiya gaya hai? (ye ek plain URL field hai, apna khud ka upload button nahi rakhti)", english: "If it's a branding logo/favicon, was a valid image URL pasted into the 'Logo URL' field? (that field is a plain URL box, it has no upload button of its own)" },
    ],
    fixUrdu:
      "Products/banners ke liye image upload ImageUploader widget se hoti hai (usi form ke andar) - upload complete hone ka wait karein phir Save karein. Store logo/favicon alag hai: wahan sirf ek image URL paste hoti hai, pehle image ko kahin upload karke uska URL yahan lagayein.",
    fixEnglish:
      "Product/banner images upload via the ImageUploader widget inside that same form - wait for the upload to finish before saving. Store logo/favicon is different: that field only accepts a pasted image URL, so upload the image elsewhere first and paste its URL there.",
    route: "/admin/products",
    actionLabel: "Open Products",
    exampleQuestions: ["Image nahi dikh rahi", "My uploaded image isn't showing"],
  },
  {
    id: "category_missing",
    title: "Category Missing / Not Found",
    keywords: ["category missing", "category nahi mil rahi", "category ghayab", "category not found"],
    symptomUrdu: "Bani hui category kahin nazar nahi aa rahi.",
    symptomEnglish: "A created category isn't showing up anywhere.",
    checklist: [
      { urdu: "Categories list (Catalog → Categories) mein Trash filter dekha? Kahin galti se delete/trash to nahi hui?", english: "Did you check the Trash filter on Catalog → Categories - was it accidentally deleted/trashed?" },
      { urdu: "Storefront par usi category ka koi active product assigned hai?", english: "Does that category have any active product assigned to it on the storefront?" },
      { urdu: "Category ka naam sahi spell hua hai jo aap search kar rahe hain?", english: "Are you searching for the exact spelling of the category name?" },
    ],
    fixUrdu:
      "Catalog → Categories par jayen aur Trash tab check karein - agar wahan hai to restore kar sakte hain. Agar category exist karti hai lekin storefront par empty dikh rahi hai, to us category mein koi Active product assign karein.",
    fixEnglish:
      "Go to Catalog → Categories and check the Trash tab - restore it from there if it was trashed. If the category exists but looks empty on the storefront, assign an Active product to it.",
    route: "/admin/categories",
    actionLabel: "Open Categories",
    exampleQuestions: ["Category nahi mil rahi", "My category disappeared"],
  },
  {
    id: "order_status_not_updating",
    title: "Order Status Not Updating",
    keywords: ["order status nahi update", "order status stuck", "status change nahi ho raha", "order update fail"],
    symptomUrdu: "Order ka status change karne ki koshish ki lekin update nahi ho raha.",
    symptomEnglish: "Trying to change an order's status, but it isn't updating.",
    checklist: [
      { urdu: "Kya select karte waqt koi red error toast/message dikha?", english: "Did a red error toast/message appear when you selected a status?" },
      { urdu: "Jo status choose kiya wo dropdown mein genuinely available tha? (dropdown sirf allowed agla status dikhata hai - jaise Pending se sirf Confirmed ya Cancelled milega, seedha Delivered nahi)", english: "Was the status you picked genuinely offered in the dropdown? (it only ever lists valid next steps - e.g. from Pending you'll only see Confirmed or Cancelled, never a jump straight to Delivered)" },
      { urdu: "Page refresh karke dekha ke naya status save hua ya nahi?", english: "Did you refresh the page to confirm whether the new status actually saved?" },
    ],
    fixUrdu:
      "Order status ek fixed order mein hi change ho sakta hai (Pending → Confirmed → Processing → Packed → Shipped → Delivered, ya kabhi bhi Cancelled). Delivered aur Cancelled ke baad koi further change allowed nahi. Agar error toast dikhi thi, uska message batayen taake sahi wajah pata chal sake.",
    fixEnglish:
      "Order status can only move forward in a fixed sequence (Pending → Confirmed → Processing → Packed → Shipped → Delivered, or to Cancelled at any point before Delivered). No further change is allowed once Delivered or Cancelled. If an error toast appeared, its message names the exact reason.",
    route: "/admin/orders",
    actionLabel: "Open Orders",
    exampleQuestions: ["Order status change nahi ho raha", "Order status won't update"],
  },
  {
    id: "login_problem",
    title: "Can't Log In to Store Admin",
    keywords: ["login nahi ho raha", "login problem", "login issue", "cannot login", "sign in nahi ho raha", "login fail"],
    symptomUrdu: "Store Admin mein login nahi ho pa raha.",
    symptomEnglish: "Unable to log in to Store Admin.",
    checklist: [
      { urdu: "Sahi Store Admin URL (admin-yourstore.webriiz.com) se try kar rahe hain, kisi doosre store ke URL se nahi?", english: "Are you trying from the correct Store Admin URL (admin-yourstore.webriiz.com), not another store's URL?" },
      { urdu: "Email/password bilkul sahi type hua hai (case-sensitive password)?", english: "Is the email/password typed exactly right (password is case-sensitive)?" },
      { urdu: "Login screen par koi specific error message dikha (jaise 'incorrect' ya 'suspended')?", english: "Did the login screen show a specific error message (e.g. 'incorrect' or 'suspended')?" },
      { urdu: "Bohot dafa galat try karne ki wajah se temporarily rate-limited to nahi ho gaye?", english: "Have too many failed attempts triggered a temporary rate-limit?" },
    ],
    fixUrdu:
      "Agar password yaad nahi to 'Forgot password?' use karein. Agar error 'store suspended' kehta hai to Super Admin se contact karein. Agar bohot dafa attempt ho chuka hai to kuch dair (15 minute) wait karke dobara try karein.",
    fixEnglish:
      "If you don't remember the password, use 'Forgot password?'. If the error says the store is suspended, contact your Super Admin. If you've retried many times, wait about 15 minutes and try again.",
    route: "/admin/login",
    actionLabel: "Open Login Page",
    exampleQuestions: ["Login nahi ho raha", "I can't log in to Store Admin"],
  },
  {
    id: "password_reset_problem",
    title: "Password Reset Not Working",
    keywords: ["password reset problem", "reset link kaam nahi", "reset password problem", "reset link invalid", "reset link expire", "reset kaam nahi", "reset nahi ho raha"],
    symptomUrdu: "Password reset link click karne par kaam nahi kar raha, ya link nahi mil raha.",
    symptomEnglish: "The password reset link isn't working, or never arrives.",
    checklist: [
      { urdu: "Reset email bilkul sahi admin email par bheji thi?", english: "Was the reset requested for the exact correct admin email?" },
      { urdu: "Link purana (expired) to nahi, ya pehle hi ek baar use ho chuka?", english: "Is the link old (expired), or already used once before?" },
      { urdu: "Spam/junk folder check kiya?", english: "Did you check the spam/junk folder?" },
    ],
    fixUrdu:
      "Reset link ek hi baar use hoti hai aur limited time ke liye valid hoti hai - agar expire ho chuki hai to Login page se dobara 'Forgot password?' click karke naya link mangayen. Agar email hi nahi mil rahi (spam mein bhi nahi), Super Admin se contact karein - email delivery platform-level configuration par depend karti hai.",
    fixEnglish:
      "A reset link is single-use and time-limited - if it expired, go back to the Login page and click 'Forgot password?' again for a fresh one. If the email never arrives at all (not even in spam), contact your Super Admin - delivery depends on platform-level email configuration.",
    route: "/admin/login",
    actionLabel: "Open Login Page",
    exampleQuestions: ["Password reset kaam nahi kar raha", "My reset link isn't working"],
  },
  {
    id: "email_not_received",
    title: "Not Receiving an Expected Email",
    keywords: ["email nahi mila", "email not received", "email nahi aya", "mail missing", "email nahi mili", "email nahi"],
    symptomUrdu: "Koi expected email (welcome, reset, order) nahi mili.",
    symptomEnglish: "An expected email (welcome, reset, order) never arrived.",
    checklist: [
      { urdu: "Spam/junk/promotions folder check kiya?", english: "Checked spam/junk/promotions folders?" },
      { urdu: "Sahi email address use ho rahi thi (aksar owner ka email typo se galat register ho jata hai)?", english: "Is the correct email address on file (a typo at registration is a common cause)?" },
      { urdu: "Ye ek platform email thi (welcome/reset) ya store ka apna customer order email?", english: "Was this a platform email (welcome/reset) or your store's own customer order email?" },
    ],
    fixUrdu:
      "Platform emails (welcome, password reset) aur aapke store ke apne customer order emails alag systems se jate hain. Platform email na milne par Super Admin se contact karein (ye unki configuration par depend karta hai). Store ke apne order emails Settings → Email tab ki configuration par depend karte hain.",
    fixEnglish:
      "Platform emails (welcome, password reset) and your store's own customer order emails go through separate systems. If a platform email is missing, contact your Super Admin (it depends on their configuration). Your store's own order emails depend on your Settings → Email tab configuration.",
    route: "/admin/settings",
    actionLabel: "Open Settings",
    exampleQuestions: ["Email nahi mili", "I never received the email"],
  },
  {
    id: "theme_changes_not_appearing",
    title: "Theme/Homepage Changes Not Appearing on Storefront",
    keywords: ["theme changes nahi dikh rahe", "customize save nahi ho raha", "changes live nahi", "theme update nahi dikh raha"],
    symptomUrdu: "Customize Storefront ya Theme Editor mein changes kiye lekin storefront par nazar nahi aa rahe.",
    symptomEnglish: "Made changes in Customize Storefront or the Theme Editor, but they aren't showing on the storefront.",
    checklist: [
      { urdu: "Sirf 'Save Draft' kiya tha, ya 'Publish' button bhi click kiya?", english: "Did you only click 'Save Draft', or also click 'Publish'?" },
      { urdu: "Storefront ko hard-refresh kiya (browser cache purani copy dikha sakta hai)?", english: "Did you hard-refresh the storefront (the browser cache can show an older copy)?" },
    ],
    fixUrdu:
      "Changes pehle ek Draft ke taur par save hoti hain - wo sirf aapko admin preview mein dikhti hain. Storefront par live jaane ke liye Customize Storefront (ya Theme Editor) mein **'Publish'** button click karna zaroori hai.",
    fixEnglish:
      "Changes save as a Draft first - visible only in your own admin preview. To go live on the storefront, you must click the 'Publish' button in Customize Storefront (or the Theme Editor).",
    route: "/admin/appearance/customize",
    actionLabel: "Open Customize Storefront",
    exampleQuestions: ["Theme changes nahi dikh rahe", "Why aren't my customization changes showing up?"],
  },
  {
    id: "domain_not_resolving",
    title: "Custom Domain Not Resolving",
    keywords: ["domain not resolving", "domain kaam nahi kar raha", "domain nahi khul raha", "domain error"],
    symptomUrdu: "Custom domain add karwaya tha lekin abhi bhi open nahi ho raha.",
    symptomEnglish: "A custom domain was set up but still isn't opening.",
    checklist: [
      { urdu: "Domain ka DNS record aapke domain provider (GoDaddy/Namecheap/etc.) mein Webriiz ki taraf point kiya gaya hai?", english: "Has the domain's DNS record been pointed at Webriiz through your domain provider (GoDaddy/Namecheap/etc.)?" },
      { urdu: "Super Admin ne domain ko aapke store record mein add kiya hai?", english: "Has your Super Admin added the domain to your store's record?" },
      { urdu: "DNS change ke baad kaafi time guzar chuka hai? (DNS propagate hone mein kuch ghante lag sakte hain)", english: "Has enough time passed since the DNS change? (DNS propagation can take a few hours)" },
    ],
    fixUrdu:
      "Custom domain connect karne ke 2 hisse hain: (1) DNS aapke provider par point karna, (2) domain ko aapke store se link karna (ye Super Admin karta hai, self-service nahi hai). Dono steps zaroori hain, aur DNS ko propagate hone mein waqt lagta hai.",
    fixEnglish:
      "Connecting a custom domain has two parts: (1) pointing DNS at your provider, (2) linking the domain to your store (done by your Super Admin, not self-service). Both steps are required, and DNS propagation can take time.",
    route: "/admin/settings",
    actionLabel: "Open Settings",
    exampleQuestions: ["Custom domain kaam nahi kar raha", "My custom domain won't resolve"],
  },
  {
    id: "checkout_issue",
    title: "Customer Can't Complete Checkout",
    keywords: ["checkout issue", "checkout nahi ho raha", "checkout problem", "customer order place nahi kar pa raha"],
    symptomUrdu: "Customer checkout complete nahi kar pa raha.",
    symptomEnglish: "A customer can't complete checkout.",
    checklist: [
      { urdu: "Kam se kam ek Payment Method (COD, Bank Transfer, etc.) Settings → Payments mein enabled hai?", english: "Is at least one Payment Method (COD, Bank Transfer, etc.) enabled under Settings → Payments?" },
      { urdu: "Shipping/Delivery rate Settings → Shipping mein configure hai?", english: "Is a shipping/delivery rate configured under Settings → Shipping?" },
      { urdu: "Customer ne Full Name, Address, aur City required fields fill ki thin?", english: "Did the customer fill in the required Full Name, Address, and City fields?" },
    ],
    fixUrdu:
      "Checkout tab tak complete nahi hota jab tak: (a) cart khali na ho, (b) phone ya email diya gaya ho, (c) Shipping Address ke required fields (Full Name, Street Address, City) bhare ho'n. Agar in mein se koi missing hai, customer ko wahin ek clear error message dikhta hai.",
    fixEnglish:
      "Checkout won't complete unless: (a) the cart isn't empty, (b) a phone or email is given, (c) the Shipping Address required fields (Full Name, Street Address, City) are filled. If any of these is missing, the customer sees a clear inline error right there.",
    route: "/admin/settings",
    actionLabel: "Open Settings",
    exampleQuestions: ["Checkout nahi ho raha", "Customer can't check out"],
  },
  {
    id: "cart_issue",
    title: "Cart Showing Empty or Losing Items",
    keywords: ["cart issue", "cart khali dikh raha", "cart empty", "cart items gayab", "cart problem"],
    symptomUrdu: "Cart khali dikh raha hai ya items gayab ho jate hain.",
    symptomEnglish: "The cart shows empty, or items disappear from it.",
    checklist: [
      { urdu: "Product 'Add to Bag' click karne ke turant baad, page reload to nahi kiya?", english: "Was the page reloaded right after clicking 'Add to Bag'?" },
      { urdu: "Browser ka private/incognito mode use ho raha tha?", english: "Was the browser in private/incognito mode?" },
      { urdu: "Product jis waqt add hua tha, us waqt Active/in-stock tha?", english: "Was the product Active/in-stock at the time it was added?" },
    ],
    fixUrdu:
      "Cart is browser mein (localStorage) save hoti hai, alag device/browser mein carry nahi hoti. Ek fresh page-load ke foran baad content thodi der (ek second se kam) mein load hoti hai - agar bohot jaldi check karein to khali lag sakti hai. Private/incognito windows apna alag, khali storage rakhti hain.",
    fixEnglish:
      "The cart is saved in that browser (localStorage) - it doesn't carry over to a different device or browser. Right after a fresh page load, its contents take a brief moment to populate - checking too fast can look empty. Private/incognito windows keep their own separate, empty storage.",
    route: "/admin/products",
    actionLabel: "Open Products",
    exampleQuestions: ["Cart khali dikh raha hai", "Items keep disappearing from the cart"],
  },
];
