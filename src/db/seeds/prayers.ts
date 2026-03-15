import { db } from '@/db';
import { prayers } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    // Helper function to generate random date between two dates
    const randomDate = (start: Date, end: Date) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    // Helper function to generate random community replies
    const generateReplies = (count: number, prayerCreatedAt: string) => {
        const replyTexts = [
            "Praying for you brother! God's got you 💪",
            "Lifting you up right now 🙏",
            "Orando por ti hermano. Dios es fiel!",
            "Lord Jesus we ask for healing. Amen",
            "u got this!! believing for breakthrough 🙌",
            "Padre celestial, te pedimos sanación y paz",
            "Standing with you in prayer friend",
            "praying rn!! God hears u 💙",
            "Praying for strength and peace for you",
            "God is with you always. Praying now 🙏",
            "Que Dios te bendiga y te de paz",
            "im praying for u!! keep faith",
            "Lifting your situation to the Lord",
            "Orando por sanación completa",
            "Lord we ask for your intervention. Amen",
            "believing God for a miracle 🙌",
            "u r not alone!! praying hard",
            "Dios tiene el control. Orando por ti",
            "Covered in prayer right now ❤️",
            "Father God please help them. Amen",
            "praying for provision n peace",
            "Te tengo en mis oraciones hermano",
            "God sees you and hears you 💙",
            "asking God for breakthrough today",
            "Praying for wisdom and guidance",
            "orando por tu familia 🙏",
            "Lord please show up in this situation",
            "sending prayers ur way!!",
            "Que el Señor te de fuerza",
            "Believing with you for healing 💪"
        ];

        const prayerDate = new Date(prayerCreatedAt);
        const now = new Date();
        const replies = [];

        for (let i = 0; i < count; i++) {
            const replyDate = randomDate(prayerDate, now);
            replies.push({
                text: replyTexts[Math.floor(Math.random() * replyTexts.length)],
                createdAt: replyDate.toISOString()
            });
        }

        return replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const startDate = new Date('2024-07-01');
    const endDate = new Date('2025-11-12');

    const names = [
        "Marcus Johnson", "Sarah Chen", "David Martinez", "Jennifer Thompson", "Carlos Rodriguez",
        "Ashley Williams", "Michael Kim", "Jessica Brown", "Robert Garcia", "Maria Santos",
        "James Anderson", "Lisa Nguyen", "Daniel Lee", "Amanda Wilson", "Jose Hernandez",
        "Emily Davis", "Christopher Taylor", "Michelle Wong", "Kevin Moore", "Nicole Jackson",
        "Brandon White", "Stephanie Lopez", "Justin Harris", "Rachel Martin", "Andrew Thompson",
        "Crystal Robinson", "Matthew Clark", "Vanessa Lewis", "Ryan Young", "Melissa Walker"
    ];

    // Generate 50 new prayers
    const newPrayers = [
        {
            name: null,
            prayerRequest: "plz pray for my dad. hes in icu n we need a miracle 🙏",
            category: "Healing",
            isAnonymous: true,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Maria Santos",
            prayerRequest: "Por favor oren por mi familia. Mi esposo perdió su trabajo y no sabemos cómo vamos a pagar la renta. Confiamos en Dios pero estamos asustados.",
            category: "Provision",
            isAnonymous: false,
            prayCount: 6,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: "Gracias por sus oraciones. Mi esposo encontró trabajo nuevo! Dios es fiel! 🙏❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Marcus Johnson",
            prayerRequest: "I've been clean for 6 months now but the cravings are getting stronger every day. Some days I don't know if I can make it another hour. My family doesn't trust me anymore and I can't blame them after everything I put them through. I just need strength to keep going one more day at a time. Please pray God gives me the courage to face each moment without going back to what broke me.",
            category: "Strength",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: "Update: made it to 8 months. still hard but ur prayers help so much. thank u all 💪",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "Need prayers for mi madre. She's going through chemo y the medical bills are crazy. No tengo insurance and idk what to do. Praying for a miracle.",
            category: "Healing",
            isAnonymous: true,
            prayCount: 7,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Sarah Chen",
            prayerRequest: "My teenage daughter hasn't come home in 3 days. I know she's been struggling with depression and using drugs. I'm terrified something has happened to her. Please pray for her safety and that she comes home soon. I don't know what to do anymore.",
            category: "Family",
            isAnonymous: false,
            prayCount: 9,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: "She came home yesterday. Thank you all for praying. She agreed to go to rehab. God is faithful!! 🙏❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "lost my job today n got eviction notice. have 2 kids n nowhere to go. scared",
            category: "Provision",
            isAnonymous: true,
            prayCount: 5,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(5, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "David Martinez",
            prayerRequest: "Necesito oracion por mi matrimonio. Mi esposa quiere el divorcio despues de 15 años. No se que paso. Estoy destrozado. Dios por favor ayudanos a reconciliar. Tenemos tres hijos que necesitan su familia unida.",
            category: "Family",
            isAnonymous: false,
            prayCount: 4,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(4, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Jennifer Thompson",
            prayerRequest: "I was diagnosed with stage 4 breast cancer last week. I'm only 34 and have two young kids. I'm so scared but trying to trust God. Please pray for healing and strength for my family. We need a miracle.",
            category: "Healing",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "court date tomorrow for custody. ex is lying bout everything. plz pray judge sees truth 🙏",
            category: "Family",
            isAnonymous: true,
            prayCount: 6,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: "update - got full custody!! God answered!! thank u everyone 🙌❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Carlos Rodriguez",
            prayerRequest: "Been applying for jobs for 8 months now. Got rejected again today. Bills piling up and I feel like such a failure. My wife is pregnant with our third child and I can't even provide. Please pray God opens a door soon because I'm losing hope.",
            category: "Provision",
            isAnonymous: false,
            prayCount: 7,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: "PRAISE GOD!! Got hired today! Better job than I even applied for! Thank u all for praying!! 💪🙏",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "Mi hijo esta en la carcel por drogas. No se que hacer. Oro todos los dias pero parece que nada cambia. Por favor ayudenme a orar por el.",
            category: "Family",
            isAnonymous: true,
            prayCount: 5,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(5, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Ashley Williams",
            prayerRequest: "Please pray for guidance. I feel God calling me to ministry but I'm scared to leave my stable job. I'm a single mom and can't afford to take risks but I also don't want to miss what God has for me. I need clarity and peace about this decision.",
            category: "Guidance",
            isAnonymous: false,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "suicidal thoughts getting worse. dont wanna be here anymore. tired of fighting",
            category: "Strength",
            isAnonymous: true,
            prayCount: 9,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: "went to hospital. getting help. thx for praying. sorry for scaring everyone",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Michael Kim",
            prayerRequest: "My father had a massive stroke yesterday. Doctors say he might not make it through the night. He's only 58 and we weren't ready for this. Please pray for healing and if it's his time, that he goes peacefully. Our family is devastated.",
            category: "Healing",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "pregnant n my boyfriend left. idk how ima do this alone. so scared",
            category: "Strength",
            isAnonymous: true,
            prayCount: 6,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Jessica Brown",
            prayerRequest: "Necesito un milagro financiero. Voy a perder mi casa en dos semanas si no pago. He trabajado dos empleos pero no es suficiente. Tengo cuatro niños y no se donde iremos. Por favor oren que Dios provea.",
            category: "Provision",
            isAnonymous: false,
            prayCount: 7,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: "Dios proveyó! Una familia de la iglesia pagó todo!! No puedo creer Su bondad! 🙏❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "my ptsd from military is getting worse. cant sleep. having flashbacks every day. VA keeps canceling my appointments. idk what to do anymore",
            category: "Healing",
            isAnonymous: true,
            prayCount: 5,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(5, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Robert Garcia",
            prayerRequest: "I've been pastoring this small church for 15 years and I'm completely burned out. Attendance keeps dropping, people keep leaving, and I feel like I'm failing God. I don't know if I should keep going or step down. Please pray for wisdom and renewed passion for ministry.",
            category: "Ministry",
            isAnonymous: false,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "immigration hearing next week. might get deported n separated from my kids. they r US citizens but im not. so scared plz pray",
            category: "Family",
            isAnonymous: true,
            prayCount: 9,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Lisa Nguyen",
            prayerRequest: "My husband confessed to having an affair. We've been married 20 years and I thought we were happy. I'm completely broken. I want to forgive him but I don't know if I can trust him again. Please pray for healing and wisdom about what to do.",
            category: "Family",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "relapsed yesterday after 2 years clean. hate myself. feel like giving up completely",
            category: "Strength",
            isAnonymous: true,
            prayCount: 7,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Daniel Lee",
            prayerRequest: "Por favor oren por mi hija. Tiene 16 años y acaba de decirnos que esta embarazada. Estamos en shock y no sabemos como ayudarla. Necesitamos sabiduria y paz como familia.",
            category: "Family",
            isAnonymous: false,
            prayCount: 6,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "mom died last week. cant stop crying. everything reminds me of her. idk how to go on without her 💔",
            category: "Strength",
            isAnonymous: true,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Amanda Wilson",
            prayerRequest: "I just found out my son has autism. The doctors say it's severe and he may never speak or live independently. I'm trying to trust God but I'm so scared for his future. Please pray for healing and that we have the strength to give him everything he needs.",
            category: "Healing",
            isAnonymous: false,
            prayCount: 9,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "homeless for 3 months now. living in my car with my dog. trying to find work but no address means no job. cold n hungry most days",
            category: "Provision",
            isAnonymous: true,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: "update: someone from prayer wall found me n helped me get apartment!! God is real!! 🙏❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Jose Hernandez",
            prayerRequest: "Mi hermano fue asesinado hace dos meses. La policia no ha encontrado al culpable. Estoy lleno de rabia y no puedo perdonar. Se que Dios quiere que perdone pero no puedo. Por favor oren por mi corazon.",
            category: "Strength",
            isAnonymous: false,
            prayCount: 7,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "cancer came back. doctors say theres nothing else they can do. trying to prepare my kids but how do u tell ur babies mommy is dying 💔",
            category: "Healing",
            isAnonymous: true,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Emily Davis",
            prayerRequest: "I need prayer for direction. I graduated college 2 years ago and still haven't found a job in my field. I'm drowning in student loans and working at a coffee shop just to survive. I feel like I wasted 4 years and all that money. Please pray God shows me what to do next.",
            category: "Guidance",
            isAnonymous: false,
            prayCount: 5,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(5, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "Mi esposo me pega. Tengo miedo de irme porque no tengo familia aqui y no trabajo. Tengo dos bebes chiquitos. No se que hacer. Ayuda por favor.",
            category: "Family",
            isAnonymous: true,
            prayCount: 9,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Christopher Taylor",
            prayerRequest: "Been praying for a breakthrough in my music career for 10 years. Nothing is happening. I'm 35 now and starting to think I missed God's plan for my life. Feeling really discouraged and lost. Please pray for clarity and renewed hope.",
            category: "Breakthrough",
            isAnonymous: false,
            prayCount: 4,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(4, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "anxiety attacks every single day. cant leave house. lost my job because of it. scared all the time. plz pray this stops",
            category: "Healing",
            isAnonymous: true,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Michelle Wong",
            prayerRequest: "Please pray for my marriage. We lost our baby at 7 months pregnant last year and haven't been the same since. My husband won't talk about it and I'm falling apart. We're growing further apart every day. I don't want to lose him too.",
            category: "Family",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "got fired today for no reason. manager just doesnt like me. got bills due n rent due. no savings. what am i gonna do",
            category: "Provision",
            isAnonymous: true,
            prayCount: 6,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Kevin Moore",
            prayerRequest: "Mi madre tiene demencia y cada dia esta peor. Ya no me reconoce. Es tan dificil verla asi. Necesito fuerza para cuidarla y paz sabiendo que algun dia estara con Jesus.",
            category: "Strength",
            isAnonymous: false,
            prayCount: 7,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "14 years old n my parents r getting divorced. dad cheated. mom cries all the time. feel like its my fault somehow. dont know who to live with. everything sucks",
            category: "Family",
            isAnonymous: true,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Nicole Jackson",
            prayerRequest: "I've been believing God for a baby for 8 years. Just had my 5th miscarriage last week. The doctors say I should stop trying but I feel like God promised me a child. I'm exhausted and heartbroken but I don't want to give up if this is from God. Please pray for clarity and healing.",
            category: "Healing",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: "OMG IM PREGNANT AND BABY IS HEALTHY!! 12 weeks today!! Thank you all for not giving up praying!! 🙏❤️👶",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "brother died from overdose yesterday. he was only 22. cant believe hes gone. pray for my parents plz they r destroyed",
            category: "Strength",
            isAnonymous: true,
            prayCount: 9,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Brandon White",
            prayerRequest: "God is calling me to plant a church but I have no money, no building, and no team. Everyone thinks I'm crazy. But I can't shake this calling. Please pray God provides everything needed and gives me the courage to take the first step.",
            category: "Ministry",
            isAnonymous: false,
            prayCount: 6,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "escaping abusive relationship pero no tengo donde ir. tengo $200 to my name. scared he gonna find me. need protection n safety",
            category: "Family",
            isAnonymous: true,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Stephanie Lopez",
            prayerRequest: "My son is in Iraq serving our country and I haven't heard from him in 3 weeks. The military won't tell me anything. I'm terrified something has happened to him. Please pray for his safety and that I hear from him soon. I can't sleep or eat until I know he's okay.",
            category: "Healing",
            isAnonymous: false,
            prayCount: 8,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: "He called today!! He's safe!! They were in a combat zone with no communication. Thank God!! 🙏❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "bipolar disorder is destroying my life. cant keep a job. friends all left. family tired of dealing with me. medication not working. idk what to do",
            category: "Healing",
            isAnonymous: true,
            prayCount: 7,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Justin Harris",
            prayerRequest: "Necesito oracion urgente. Mi padre esta en el hospital muriendo y no hemos hablado en 10 años porque peleamos. No se si me dejara verlo. Quiero hacer las paces antes que sea tarde. Por favor oren que Dios ablande su corazon.",
            category: "Family",
            isAnonymous: false,
            prayCount: 9,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: "Nos reconciliamos!! Pase sus ultimos dias con el. Murio en paz con Dios y conmigo. Gracias por orar 🙏",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "baby has heart defect. surgery tomorrow. doctors say 50/50 chance. shes only 3 months old. plz pray she makes it 💔🙏",
            category: "Healing",
            isAnonymous: true,
            prayCount: 10,
            isAnswered: true,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: "SURGERY WENT PERFECT!! Doctor said it went better than expected!! Our baby girl is gonna be ok!! 🙏❤️",
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Rachel Martin",
            prayerRequest: "I feel God calling me to adopt but my husband says no. We have 3 kids already and he thinks it's too much. I can't shake this feeling that there's a child out there meant to be ours. Please pray for clarity and that God speaks to my husband's heart.",
            category: "Guidance",
            isAnonymous: false,
            prayCount: 6,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(6, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "coming out to my christian parents tomorrow. scared they gonna disown me. need courage n pray they still love me 🏳️‍🌈",
            category: "Family",
            isAnonymous: true,
            prayCount: 5,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(5, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Andrew Thompson",
            prayerRequest: "Mi negocio esta quebrado. Deudas de $200k que no puedo pagar. Puede que pierda mi casa tambien. Trabajo 18 horas al dia tratando de salvarlo pero nada funciona. Necesito un milagro o sabiduria para saber cuando rendirme.",
            category: "Provision",
            isAnonymous: false,
            prayCount: 7,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(7, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "raped 3 weeks ago. cant tell anyone. feel so dirty n broken. having nightmares every night. dont know how to keep living",
            category: "Healing",
            isAnonymous: true,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Crystal Robinson",
            prayerRequest: "I've been believing for a breakthrough in my finances for 5 years. I tithe faithfully, I pray, I work hard, but nothing changes. Bills keep piling up and I can barely feed my kids. Starting to wonder if God hears me at all. Please pray my faith doesn't die.",
            category: "Breakthrough",
            isAnonymous: false,
            prayCount: 8,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(8, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: null,
            prayerRequest: "grandson born addicted to drugs cuz of my daughter. CPS might take him. trying to get custody pero soy vieja y no se si puedo. plz pray",
            category: "Family",
            isAnonymous: true,
            prayCount: 9,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(9, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        },
        {
            name: "Matthew Clark",
            prayerRequest: "I was just diagnosed with early onset Alzheimer's at 52 years old. I'm watching my father go through this and now it's my turn. I'm terrified of forgetting my wife and kids. Please pray for a miracle or at least peace as I face this disease.",
            category: "Healing",
            isAnonymous: false,
            prayCount: 10,
            isAnswered: false,
            prayers: JSON.stringify(generateReplies(10, randomDate(startDate, endDate).toISOString())),
            opReply: null,
            createdAt: randomDate(startDate, endDate).toISOString(),
            updatedAt: randomDate(startDate, endDate).toISOString()
        }
    ];

    // Insert 50 new prayers
    await db.insert(prayers).values(newPrayers);

    console.log('✅ Inserted 50 new prayers');

    // Update existing 12 prayers
    const existingUpdates = [
        {
            id: 1,
            createdAt: new Date('2024-08-15').toISOString(),
            updatedAt: new Date('2024-08-15').toISOString(),
            prayers: JSON.stringify(generateReplies(5, new Date('2024-08-15').toISOString())),
            prayCount: 5,
            opReply: null,
            isAnswered: false
        },
        {
            id: 2,
            createdAt: new Date('2024-09-01').toISOString(),
            updatedAt: new Date('2024-09-01').toISOString(),
            prayers: JSON.stringify(generateReplies(7, new Date('2024-09-01').toISOString())),
            prayCount: 7,
            opReply: "thank u all for praying!! situation is getting better 🙏",
            isAnswered: true
        },
        {
            id: 3,
            createdAt: new Date('2024-07-20').toISOString(),
            updatedAt: new Date('2024-07-20').toISOString(),
            prayers: JSON.stringify(generateReplies(6, new Date('2024-07-20').toISOString())),
            prayCount: 6,
            opReply: null,
            isAnswered: false
        },
        {
            id: 4,
            createdAt: new Date('2024-10-05').toISOString(),
            updatedAt: new Date('2024-10-05').toISOString(),
            prayers: JSON.stringify(generateReplies(8, new Date('2024-10-05').toISOString())),
            prayCount: 8,
            opReply: "God answered!! Everything worked out better than I could imagine!! 🙌❤️",
            isAnswered: true
        },
        {
            id: 5,
            createdAt: new Date('2024-08-28').toISOString(),
            updatedAt: new Date('2024-08-28').toISOString(),
            prayers: JSON.stringify(generateReplies(4, new Date('2024-08-28').toISOString())),
            prayCount: 4,
            opReply: null,
            isAnswered: false
        },
        {
            id: 6,
            createdAt: new Date('2024-11-01').toISOString(),
            updatedAt: new Date('2024-11-01').toISOString(),
            prayers: JSON.stringify(generateReplies(6, new Date('2024-11-01').toISOString())),
            prayCount: 6,
            opReply: "update - still hard but feeling more hopeful. thx for standing with me",
            isAnswered: false
        },
        {
            id: 7,
            createdAt: new Date('2024-07-10').toISOString(),
            updatedAt: new Date('2024-07-10').toISOString(),
            prayers: JSON.stringify(generateReplies(8, new Date('2024-07-10').toISOString())),
            prayCount: 8,
            opReply: null,
            isAnswered: false
        },
        {
            id: 8,
            createdAt: new Date('2024-09-15').toISOString(),
            updatedAt: new Date('2024-09-15').toISOString(),
            prayers: JSON.stringify(generateReplies(7, new Date('2024-09-15').toISOString())),
            prayCount: 7,
            opReply: "PRAISE REPORT!! Doctors say its a miracle!! Thank u for not giving up!! 🙏❤️",
            isAnswered: true
        },
        {
            id: 9,
            createdAt: new Date('2024-10-20').toISOString(),
            updatedAt: new Date('2024-10-20').toISOString(),
            prayers: JSON.stringify(generateReplies(5, new Date('2024-10-20').toISOString())),
            prayCount: 5,
            opReply: null,
            isAnswered: false
        },
        {
            id: 10,
            createdAt: new Date('2024-08-05').toISOString(),
            updatedAt: new Date('2024-08-05').toISOString(),
            prayers: JSON.stringify(generateReplies(6, new Date('2024-08-05').toISOString())),
            prayCount: 6,
            opReply: "still waiting on God but ur prayers give me strength to keep believing",
            isAnswered: false
        },
        {
            id: 11,
            createdAt: new Date('2024-09-25').toISOString(),
            updatedAt: new Date('2024-09-25').toISOString(),
            prayers: JSON.stringify(generateReplies(8, new Date('2024-09-25').toISOString())),
            prayCount: 8,
            opReply: null,
            isAnswered: false
        },
        {
            id: 12,
            createdAt: new Date('2024-07-30').toISOString(),
            updatedAt: new Date('2024-07-30').toISOString(),
            prayers: JSON.stringify(generateReplies(7, new Date('2024-07-30').toISOString())),
            prayCount: 7,
            opReply: "God came through!! Can't believe His faithfulness!! Gracias por orar!! 🙏🙌",
            isAnswered: true
        }
    ];

    for (const update of existingUpdates) {
        await db.update(prayers)
            .set({
                createdAt: update.createdAt,
                updatedAt: update.updatedAt,
                prayers: update.prayers,
                prayCount: update.prayCount,
                opReply: update.opReply,
                isAnswered: update.isAnswered
            })
            .where(eq(prayers.id, update.id));
    }

    console.log('✅ Updated 12 existing prayers with community replies and timestamps');
    console.log('✅ Prayers seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});