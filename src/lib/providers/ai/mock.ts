import type {
  AIGenerateRequest,
  AIGenerateResult,
  AIProvider,
} from "@/lib/providers/ai/types";

/**
 * Context-aware conversational AI companion.
 * Understands multi-turn history, adapts dynamically to student emotion,
 * and never repeats the same static response.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "mock";

  private craftContextualReply(messages: { role: string; content: string }[], language?: string): string {
    const nonSystem = messages.filter((m) => m.role !== "system");
    const userMessages = nonSystem.filter((m) => m.role === "user");
    const lastUserMsg = userMessages[userMessages.length - 1]?.content ?? "";
    const priorUserMsg = userMessages[userMessages.length - 2]?.content ?? "";
    const turnCount = userMessages.length;

    const lower = lastUserMsg.toLowerCase();
    const priorLower = priorUserMsg.toLowerCase();
    const isHinglish = language === "hinglish" || /bhai|nahi|yaar|kuch|kya|bohot|hoga|raha|rahi|karun|fat|suno|hai/i.test(lower);

    // Crisis / Safety keywords (if reached here before hard boundary)
    if (/suicide|kill myself|end my life|mar jaunga|mar jau|harm myself/i.test(lower)) {
      return isHinglish
        ? "Main tumhari bohot parwah karta hoon, aur tumhari safety sabse pehle hai. Please abhi kisi se baat karo — Tele-MANAS helpline 14416 pe call karo (toll-free, 24/7). Tum bilkul akele nahi ho."
        : "I care about your safety very deeply. Please know that you are not alone, and help is available right now. Please call Tele-MANAS at 14416 or reach out to someone you trust immediately.";
    }

    // ─── PLACEMENT & CAREER ANXIETY ───
    if (/placement|interview|shortlist|offer|resume|job|cgpa|package|rejection/i.test(lower) || /placement|interview/i.test(priorLower)) {
      if (turnCount === 1) {
        return isHinglish
          ? "Placement season ka pressure bohot zyada overwhelming ho sakta hai, especially jab lagta hai ki sabka kuch na kuch ho raha hai. Ek gehri saans lo. Batao, abhi kis stage pe ho aur sabse zyada kya pareshan kar raha hai?"
          : "Placement season can feel intensely draining when everyone around you seems to be moving ahead. Take a slow, steady breath. What's on your mind right now regarding the rounds or preparation?";
      }

      if (/2|two|reject|clear nahi|failed|shortlist nahi/i.test(lower)) {
        return isHinglish
          ? "Un do interviews se rejection milna sach mein bohot hurt karta hai, aur is waqt self-doubt aana natural hai. Par ek baat dhyan rakho — rejection tumhare talent ka final verdict nahi hai, bas uss particular company ki requirement ka fit tha. Kya tumhare paas aane wale dino mein aur companies aane wali hain?"
          : "Getting rejected after going through multiple rounds hurts deeply, and it's completely normal to feel demotivated right now. But remember that interview outcomes don't define your entire capability or future. Do you have other upcoming drives lined up this week?";
      }

      if (/ab kya|kya karun|what to do|lost|helpless|future/i.test(lower)) {
        return isHinglish
          ? "Jab sab kuch ek saath rukta hua lagta hai, toh agle 6 mahine ka sochna band karo. Bas agle 24 ghante pe focus karo. Thoda rest lo, aur kal fresh mind se resume ya core concepts ka ek chhota revision plan karenge. Abhi kuch khaaya ya paani piya?"
          : "When you feel lost, trying to figure out the next six months only amplifies the anxiety. Let's ground this: what is one small, manageable thing you can do for yourself tonight to just reset?";
      }

      return isHinglish
        ? `Main samajh sakta hoon. ${lastUserMsg.slice(0, 40)}... wali baat se jo stress ho raha hai, usko akele jhelne ki zaroorat nahi hai. Tumne pichhle semesters mein bhi tough challenges overcome kiye hain. Aage ka kya plan socha hai?`
        : `I hear you completely. The weight of this placement cycle is real. But you have navigated difficult semesters before. What feels like the next priority right now?`;
    }

    // ─── EXAMS, STUDY & BACKLOGS ───
    if (/exam|study|syllabus|padhai|backlog|unit|marks|grades|viva|midsem|endsem/i.test(lower) || /exam|study/i.test(priorLower)) {
      if (turnCount === 1) {
        return isHinglish
          ? "Exams ka stress jab peak pe hota hai toh syllabus dekh kar freeze ho jana bilkul normal hai. Sabse pehle ek glass paani piyo. Saara syllabus ek saath nahi sochna. Kaunsa subject sabse zyada darr de raha hai?"
          : "When exam anxiety peaks, it's very common for the mind to freeze up when looking at the whole syllabus. Take a gentle breath. What's the specific topic or subject causing the most friction?";
      }

      if (/fail|dar|scared|fat rahi|kuch nahi aata|zero/i.test(lower)) {
        return isHinglish
          ? "Fail hone ka darr humein sabse zyada tab freeze karta hai jab hum perfection expect karte hain. 100% nahi karna — passing marks aur high-weightage topics pe focus karo. Jo 3-4 repeated previous-year questions hain, unko dekha hai?"
          : "The fear of failing usually kicks in when we feel we have to know everything. Let's aim for progress rather than perfection. Can we identify the 2 or 3 high-weightage concepts to review first?";
      }

      return isHinglish
        ? "Main tumhare saath hoon. Agle 20 minutes ke liye phone side mein rakh ke bas ek question attempt kar sakte ho? Chhote steps se hi confidence wapas aayega."
        : "I'm right here with you. Can you pick just one targeted section for the next 20 minutes? Breaking the inertia is the hardest part.";
    }

    // ─── HOSTEL, LONELINESS & HOMESICKNESS ───
    if (/hostel|lonely|alone|home|ghar|miss|room|friends|akela|roommate/i.test(lower)) {
      if (turnCount === 1) {
        return isHinglish
          ? "Hostel life mein jab room shaant hota hai toh akelapan bohot heavy lagta hai. Ghar ki yaad aana aur aisa feel hona bilkul valid hai. Kitna time hua ghar se aaye hue?"
          : "Hostel rooms can feel intensely lonely when everything goes quiet at night. Missing home and familiar comforts is completely valid. How long have you been feeling this distance?";
      }

      return isHinglish
        ? "Aisa lagna ki baaki sab enjoy kar rahe hain aur bas tum akele ho, ye hostel life ka sabse common illusion hai. Har koi andar se adjust hone ki koshish kar raha hota hai. Ghar pe kisi se baat hui aaj?"
        : "It often seems like everyone else has effortlessly found their group, but many are carrying the same quiet isolation. Have you had a chance to connect with anyone from home today?";
    }

    // ─── LATE NIGHT THOUGHTS / SLEEP / BURNOUT ───
    if (/sleep|neend|tired|exhausted|burnout|2 am|3 am|overthink|so nahi|rest/i.test(lower)) {
      return isHinglish
        ? "Raat ke is waqt dimag har chhoti baat ko amplify kar deta hai. Apne shoulders ko thoda loose karo aur ek gehri saans lo. Kya hum 2 minute ka slow breathing exercise karein taki mind thoda shaant ho sake?"
        : "Late at night, the mind has a tendency to magnify every worry into a crisis. Try dropping your shoulders and unclencing your jaw. Would you like to do a quick 2-minute calming breathing reset together?";
    }

    // ─── MULTI-TURN GENERAL PROGRESSION ───
    if (turnCount > 3) {
      if (/break|rest|chhutti|pause|thak|exhaust/i.test(lower)) {
        return isHinglish
          ? "Haan, ek chhota mental break lena bilkul theek hai. 24 ghante ke liye books ya preparation band karke walk pe jao ya achhi neend lo. Jab exhaustion ho, toh break productivity badhata hai, kam nahi karta."
          : "Taking a conscious pause right now is actually the healthiest choice. Stepping away for even 24 hours gives your nervous system room to decompress.";
      }
      if (/parents|ghar|family|expect|papa|mummy/i.test(lower)) {
        return isHinglish
          ? "Parents ki expectations ka load har student ke liye sabse heavy hota hai. Yaad rakho, wo chinta karte hain isliye poochte hain, par unki anxiety ko apne upar imposition mat banne do. Kya tum unse bol sakte ho ki abhi space chahiye?"
          : "Parental expectations often add an invisible layer of immense pressure. Remember that their worry doesn't mean you are failing.";
      }
      if (turnCount === 4) {
        return isHinglish
          ? `Tumne jo share kiya: "${lastUserMsg.length > 40 ? lastUserMsg.slice(0, 38) + "..." : lastUserMsg}" — ye dikhata hai ki tum bohot honest ho apni situation ko leke. Aisi honesty hi aage badhne ka pehla step hoti hai. Aaj raat ke liye sabse safe cheez kya kar sakte ho?`
          : `What you shared about "${lastUserMsg.length > 40 ? lastUserMsg.slice(0, 38) + "..." : lastUserMsg}" reflects real honesty with yourself. What is one grounding action you can take right now?`;
      }
      return isHinglish
        ? `Tumne abhi tak jo ${turnCount} baatein share ki hain, unse clear hai ki tum kaafi cheezein sambhaalne ki koshish kar rahe ho. Khud pe thoda reham karo — tum already apna best de rahe ho. Abhi kaisa mehsoos ho raha hai?`
        : `Across these ${turnCount} turns, it's evident you have been holding a lot of weight. Give yourself permission to pause. How are you feeling right now compared to when we started talking?`;
    }

    if (turnCount === 2) {
      return isHinglish
        ? `Samajh sakta hoon. ${lastUserMsg.length > 50 ? lastUserMsg.slice(0, 45) + "..." : lastUserMsg} — ye cheez sach mein kaafi energy drain karti hai. Iske baare mein aur batana chahoge?`
        : `I understand. That situation is genuinely draining to navigate. How long has this specific weight been building up for you?`;
    }

    // Fallback opening turn
    return isHinglish
      ? "Main yahan bina kisi judgment ke sunne ke liye hoon. Jo bhi tumhare dil ya dimag mein chal raha hai, aaram se share karo. Kya baat pareshan kar rahi hai?"
      : "I'm right here with you, without any judgment. Whatever is weighing on your mind today, take your time. What's been going on?";
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResult> {
    const started = Date.now();
    const reply = this.craftContextualReply(request.messages, request.language);

    return {
      text: reply,
      provider: this.name,
      model: "manoyug-companion-v1",
      inputTokens: request.messages.reduce((n, m) => n + m.content.length / 4, 0),
      outputTokens: reply.length / 4,
      latencyMs: Date.now() - started,
    };
  }

  async *stream(request: AIGenerateRequest): AsyncIterable<string> {
    const result = await this.generate(request);
    const words = result.text.split(" ");
    for (let i = 0; i < words.length; i += 2) {
      const chunk = words.slice(i, i + 2).join(" ") + " ";
      yield chunk;
    }
  }
}
