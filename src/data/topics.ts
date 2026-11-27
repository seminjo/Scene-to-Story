import type { TopicScene } from '../types/story';

export const TOPIC_SCENES: TopicScene[] = [
  {
    id: 'rainy-day-surprise',
    scenarioNumber: 1,
    title: 'A Rainy Day Surprise',
    subtitle: 'Scenario 1 · Waiting for the bus in the rain',
    beginning: 'You are waiting for a bus after school.',
    problem: 'It suddenly starts raining, but you do not have an umbrella.',
    endingIdea: 'Someone you do not know offers to help you.',
    imageUrl: '/src/assets/images/scene_rainy_bus_stop_1795742006370.jpg',
    imageAlt:
      'A student standing at a city bus stop in the rain while another student offers to share a bright yellow umbrella.',
    scenePromptQuestion:
      'Look at the picture and imagine your own story. Who helped you, what did you say, and how did it end?',
    level1Frames: [
      'First, I was at ___.',
      'Then, it started to rain, and I did not have ___.',
      'Next, someone came and ___.',
      'I felt ___ because ___.',
      'Finally, ___.',
    ],
    level2Keywords: {
      questions: [
        'Who?',
        'Where?',
        'What happened next?',
        'How did you feel?',
      ],
      vocabulary: [
        'bus stop',
        'rain',
        'umbrella',
        'share',
        'surprised',
        'kind',
        'waited',
        'thanked',
      ],
    },
    level3Connectors: ['first', 'then', 'next', 'because', 'so', 'finally'],
    sampleParagraph:
      'Yesterday, I waited for the bus after school. Suddenly, it started to rain, but I did not have an umbrella. I felt worried because I was getting wet. Then, another student came to the bus stop and shared her yellow umbrella with me. I was surprised and happy because she was very kind. We talked while we waited for the bus. Finally, the bus came, and I thanked her.',
    fallbackFeedback: {
      goodPoint: 'You showed the main event and your feeling clearly.',
      goodPointKorean: '비 오는 날의 중심 사건과 자신의 감정을 잘 표현했어요.',
      feedbackPoints: [
        {
          id: 'fb-1',
          category: 'Grammar',
          summaryTag: 'Check past tense',
          yourSentence: '',
          thinkAbout: 'This story happened in the past. Check the verb in this sentence.',
          question: 'This happened yesterday. What past form of the verb do you need?',
          whyExplanation:
            'We often change verbs when we talk about past events. This helps the reader know when the action happened.',
          koreanHelp: {
            thinkAbout: '이미 일어난 이야기이므로 동사의 과거형을 확인해 보세요.',
            question: '어제 일어난 일이라면 동사를 어떤 과거 형태로 써야 할까요?',
            whyExplanation:
              '이미 지난 일을 말할 때 동사를 과거형으로 바꾸면 독자가 언제 일어난 일인지 쉽게 알 수 있어요.',
          },
        },
        {
          id: 'fb-2',
          category: 'Sentence Connection',
          summaryTag: 'Connect story order',
          yourSentence: '',
          thinkAbout: 'Check how this sentence connects to the event before it.',
          question: 'Can you add a word like "then", "next", or "because" here?',
          whyExplanation:
            'Connecting words show the order of events. They make your story easy to read.',
          koreanHelp: {
            thinkAbout: '앞 문장과 이 문장이 자연스럽게 이어지는지 확인해 보세요.',
            question: '"then", "next", "because" 같은 연결어를 넣어 볼 수 있을까요?',
            whyExplanation:
              '연결어를 쓰면 사건의 순서나 이유가 잘 드러나서 이야기를 읽기 쉬워져요.',
          },
        },
      ],
      isUncertain: false,
      usedFallback: true,
    },
  },
  {
    id: 'the-lost-wallet',
    scenarioNumber: 2,
    title: 'The Lost Wallet',
    subtitle: 'Scenario 2 · Finding a wallet near a café',
    beginning: 'You find a wallet near a café.',
    problem: 'You do not know who the owner is.',
    endingIdea: 'You have to decide what to do next.',
    imageUrl: '/src/assets/images/scene_lost_wallet_1795744794586.jpg',
    imageAlt:
      'A student standing outside a neighborhood café looking at a brown wallet on the sidewalk.',
    scenePromptQuestion:
      'Think about your own story. Where were you going, what did you decide to do, and how did it end?',
    level1Frames: [
      'First, I was walking near ___.',
      'Then, I saw a ___ on the ground.',
      'I felt ___ because ___.',
      'Next, I decided to ___.',
      'Finally, ___.',
    ],
    level2Keywords: {
      questions: [
        'Who?',
        'Where?',
        'What happened next?',
        'How did you feel?',
      ],
      vocabulary: [
        'café',
        'wallet',
        'owner',
        'looked around',
        'worried',
        'decided',
        'gave back',
        'happy',
      ],
    },
    level3Connectors: ['first', 'then', 'next', 'because', 'so', 'finally'],
    sampleParagraph:
      'Yesterday, I walked past a café after school. Suddenly, I saw a brown wallet near a table. I picked it up, but I did not know the owner. First, I felt worried because someone lost it. Next, I went inside the café and gave the wallet to the worker. A few minutes later, a man came back looking for it. Finally, he got his wallet back, and I felt proud.',
    fallbackFeedback: {
      goodPoint: 'You clearly told what you found near the café.',
      goodPointKorean: '카페 근처에서 지갑을 발견한 상황을 분명하게 썼어요.',
      feedbackPoints: [
        {
          id: 'fb-1',
          category: 'Grammar',
          summaryTag: 'Check past tense',
          yourSentence: '',
          thinkAbout: 'This story happened in the past. Check the verb in this sentence.',
          question: 'What is the past form of this action verb?',
          whyExplanation:
            'Using past tense verbs shows that the story already happened. This keeps the time clear.',
          koreanHelp: {
            thinkAbout: '이미 일어난 이야기이므로 동사의 과거형을 확인해 보세요.',
            question: '이 행동을 나타내는 동사의 과거형은 무엇일까요?',
            whyExplanation:
              '과거형 동사를 쓰면 이야기가 이미 일어난 일임을 독자가 분명하게 알 수 있어요.',
          },
        },
        {
          id: 'fb-2',
          category: 'Missing Information',
          summaryTag: 'Add feeling or reason',
          yourSentence: '',
          thinkAbout: 'Tell the reader why you made this choice.',
          question: 'How did you feel, and why did you decide to do that?',
          whyExplanation:
            'Sharing your feeling or reason helps the reader understand your story better.',
          koreanHelp: {
            thinkAbout: '왜 그런 선택을 했는지 이유나 느낌을 조금 더 적어 보세요.',
            question: '그때 어떤 기분이었고 왜 그렇게 행동하기로 했나요?',
            whyExplanation:
              '인물의 기분이나 이유를 함께 쓰면 독자가 이야기에 더 쉽게 공감할 수 있어요.',
          },
        },
      ],
      isUncertain: false,
      usedFallback: true,
    },
  },
  {
    id: 'a-new-student',
    scenarioNumber: 3,
    title: 'A New Student',
    subtitle: 'Scenario 3 · A nervous classmate on the first morning',
    beginning: 'A new student joins your class.',
    problem: 'The student looks nervous and sits alone.',
    endingIdea: 'You decide whether and how to talk to the student.',
    imageUrl: '/src/assets/images/scene_new_student_1795744794217.jpg',
    imageAlt:
      'Inside a bright school classroom, a new student sits alone near the window while a classmate looks over kindly.',
    scenePromptQuestion:
      'Create your own story. How did the new student look, what did you decide to do, and what happened next?',
    level1Frames: [
      'First, a new student came to ___.',
      'The student sat ___ and looked ___.',
      'I felt ___ because ___.',
      'Then, I walked over and ___.',
      'Finally, ___.',
    ],
    level2Keywords: {
      questions: [
        'Who?',
        'Where?',
        'What happened next?',
        'How did you feel?',
      ],
      vocabulary: [
        'classroom',
        'new student',
        'alone',
        'nervous',
        'smiled',
        'said hello',
        'talked',
        'friendly',
      ],
    },
    level3Connectors: ['first', 'then', 'next', 'because', 'so', 'finally'],
    sampleParagraph:
      'This morning, a new student joined my class. He sat alone near the window and looked very nervous. I felt sorry for him because it was his first day. Then, I walked over to his desk and said hello. I asked his name and showed him where the cafeteria was. Next, he smiled and talked with me. Finally, we ate lunch together, and he looked much happier.',
    fallbackFeedback: {
      goodPoint: 'You noticed the new student’s feeling in the classroom.',
      goodPointKorean: '교실에 온 새 친구의 기분을 잘 살펴서 표현했어요.',
      feedbackPoints: [
        {
          id: 'fb-1',
          category: 'Sentence Form',
          summaryTag: 'Check be verb with adjectives',
          yourSentence: '',
          thinkAbout: 'Words like "nervous" or "happy" are adjectives. Check what word you need before an adjective.',
          question: 'The story happened in the past. What be verb can you use here?',
          whyExplanation:
            'In English, we use a be verb before an adjective to make a complete sentence.',
          koreanHelp: {
            thinkAbout: '"nervous"나 "happy" 같은 형용사 앞에는 be동사가 필요한지 확인해 보세요.',
            question: '과거의 상태나 기분을 말할 때 어떤 be동사를 쓸 수 있을까요?',
            whyExplanation:
              '영어에서는 형용사로 문장을 만들 때 앞에 알맞은 be동사를 함께 써야 문장이 완성돼요.',
          },
        },
        {
          id: 'fb-2',
          category: 'Story Order',
          summaryTag: 'Show what happened next',
          yourSentence: '',
          thinkAbout: 'Show the order between seeing the student and talking to them.',
          question: 'Can you use "first", "then", or "finally" to show the order?',
          whyExplanation:
            'Order words help the reader follow each step of your story from start to finish.',
          koreanHelp: {
            thinkAbout: '친구를 본 뒤 어떤 순서로 행동했는지 시간 연결어를 확인해 보세요.',
            question: '"first", "then", "finally" 중 알맞은 순서 표현을 넣을 수 있을까요?',
            whyExplanation:
              '순서를 나타내는 말을 넣으면 이야기의 흐름을 처음부터 끝까지 쉽게 따라갈 수 있어요.',
          },
        },
      ],
      isUncertain: false,
      usedFallback: true,
    },
  },
];
