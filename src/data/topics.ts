import type { TopicScene } from '../types/story';

export const TOPIC_SCENES: TopicScene[] = [
  {
    id: 'rainy-day-surprise',
    scenarioNumber: 1,
    title: 'A Rainy Day Surprise',
    subtitle: 'Scenario 1 · An unexpected offer at the bus stop',
    beginning: 'You are waiting for a bus after school.',
    problem: 'It suddenly starts raining, but you do not have an umbrella.',
    endingIdea: 'Someone you do not know offers to help you.',
    imageUrl: '/src/assets/images/scene_rainy_bus_stop_1795742006370.jpg',
    imageAlt:
      'A high school student standing at a city bus stop in the rain while another student offers to share a bright yellow umbrella.',
    scenePromptQuestion:
      'Imagine the details of this moment in your own way. Who offered help, what did you talk about, and how did it end?',
    level1Frames: [
      'Yesterday, I was waiting for ___ when ___.',
      'I did not have ___, so I felt ___.',
      'Then, someone came and ___.',
      'After that, we ___ while we waited.',
      'Finally, ___ and I felt ___.',
    ],
    level2Keywords: {
      questions: [
        'Who was at the bus stop?',
        'Where did it happen?',
        'What happened when the rain started?',
        'What happened next and how did it end?',
      ],
      vocabulary: [
        'bus stop',
        'suddenly',
        'umbrella',
        'share',
        'surprised',
        'grateful',
        'waited',
        'thanked',
      ],
    },
    level3Connectors: ['First', 'Then', 'After that', 'While', 'Because', 'So', 'Finally'],
    sampleParagraph:
      'Yesterday, I was waiting for the bus after school when it suddenly started to rain. I did not have an umbrella, so I tried to stand under the bus stop sign. Then, another student came and shared her umbrella with me. At first, I felt surprised because we did not know each other. We talked about school while we waited for the bus. Finally, the bus arrived, and I thanked her for helping me. It was a small but kind surprise on a rainy day.',
    fallbackHint: {
      focusCategory: 'Grammar · Past tense verbs',
      targetSentence: '',
      praise: 'You clearly described the main event and feeling at the rainy bus stop.',
      fix: 'Look closely at the highlighted part in your story.',
      explanation:
        'Your story happens in the past, so matching your action verbs to past time helps readers follow.',
      question: 'Which verb form do we usually use for an event that happened yesterday?',
      whyExplanation:
        'English verbs often change form when we talk about completed events in the past. Checking the main action verb makes the timeline clear.',
      hint2:
        'Look at the action verb in that part and check whether it shows past time.',
      hint3Pattern: 'Past action + time connector',
      hint3Example: 'Yesterday, I walked home. Then, my friend called me.',
      koreanHelp: {
        praise: '비 오는 정류장에서 일어난 핵심 사건과 감정을 분명하게 담았어요.',
        fix: '강조된 부분의 동사 표현을 한 번 더 살펴보세요.',
        explanation:
          '이야기가 이미 지난 과거의 일이므로, 동사가 과거 시제에 맞으면 흐름이 훨씬 자연스러워져요.',
        question: '어제 일어난 일을 말할 때 보통 어떤 동사 형태를 쓰는지 떠올려 볼까요?',
        whyExplanation:
          '영어에서는 이미 끝난 과거의 일을 말할 때 동사의 형태가 바뀝니다. 행동을 나타내는 동사를 확인하면 시간 흐름이 분명해집니다.',
        hint1: '노란색으로 표시된 부분에서 시간이나 시제를 나타내는 단어를 찾아보세요.',
        hint2: '해당 문장의 핵심 동사가 과거 시제에 맞는지 확인해 보세요.',
        hint3: '위 예문처럼 과거 시제 동사와 연결어(Then 등)가 함께 쓰이는 패턴을 참고해 보세요.',
      },
      isUncertain: false,
      usedFallback: true,
    },
  },
  {
    id: 'the-lost-wallet',
    scenarioNumber: 2,
    title: 'The Lost Wallet',
    subtitle: 'Scenario 2 · A choice outside a neighborhood café',
    beginning: 'You find a wallet near a café.',
    problem: 'You do not know who the owner is.',
    endingIdea: 'You have to decide what to do next.',
    imageUrl: '/src/assets/images/scene_lost_wallet_1795744794586.jpg',
    imageAlt:
      'A high school student standing outside a warm brick neighborhood café looking at a brown wallet lying near an outdoor table.',
    scenePromptQuestion:
      'Create your own story from this moment. Where were you going, what did you decide to do with the wallet, and how did it turn out?',
    level1Frames: [
      'After school, I was walking near ___ when I saw ___.',
      'I picked it up and realized ___.',
      'At first, I felt ___ because ___.',
      'Then, I decided to ___.',
      'In the end, ___ and I felt ___.',
    ],
    level2Keywords: {
      questions: [
        'Who found the wallet?',
        'Where near the café was it?',
        'What was the problem when you checked?',
        'What did you decide to do next and how did it end?',
      ],
      vocabulary: [
        'sidewalk',
        'wallet',
        'owner',
        'café staff',
        'worried',
        'decided',
        'returned',
        'relieved',
      ],
    },
    level3Connectors: ['First', 'Then', 'After that', 'Because', 'So', 'Meanwhile', 'Finally'],
    sampleParagraph:
      'Yesterday afternoon, I was walking past a quiet café on my way home when I noticed a brown wallet on the sidewalk. I looked around carefully, but nobody was sitting at the outdoor tables. At first, I felt unsure because I did not know who the owner was. Then, I decided to take the wallet inside the café and ask the staff to keep it safe. While I was writing down my contact note, a worried customer hurried back through the door looking for his wallet. Finally, the staff handed it back to him, and seeing his relieved smile made my afternoon feel special.',
    fallbackHint: {
      focusCategory: 'Sentence connection · Reason and decision',
      targetSentence: '',
      praise: 'You explained what happened when you found the wallet near the café.',
      fix: 'Look closely at the highlighted sentence about your decision.',
      explanation:
        'Using a clear reason or result word helps readers understand why the character chose that action.',
      question: 'Could you link the feeling and the decision using "because" or "so"?',
      whyExplanation:
        'Reason and result connectors show how one event leads to a choice. Without them, two actions can feel disconnected.',
      hint2:
        'Ask why the character made that choice, and check which connector joins cause and action.',
      hint3Pattern: 'Feeling/Problem + connector + decision',
      hint3Example: 'The library was closed, so I studied at a quiet table outside.',
      koreanHelp: {
        praise: '카페 앞에서 지갑을 발견한 상황을 분명하게 잘 썼어요.',
        fix: '강조된 부분에서 인물의 결정이 어떻게 이어지는지 살펴보세요.',
        explanation:
          '이유나 결과를 나타내는 연결어를 쓰면 인물이 왜 그런 선택을 했는지 독자가 쉽게 이해할 수 있어요.',
        question: '"because"나 "so"를 써서 감정과 행동을 자연스럽게 이어 볼 수 있을까요?',
        whyExplanation:
          '이유와 결과를 잇는 연결어는 사건이 어떻게 선택으로 이어지는지 보여 줍니다. 연결어가 없으면 문장들이 따로 떨어져 보일 수 있습니다.',
        hint1: '강조된 문장에서 원인과 결과가 이어지는 부분을 살펴보세요.',
        hint2: '왜 그런 결정을 내렸는지 생각하며 알맞은 연결어를 골라 보세요.',
        hint3: '예문에서 "so"가 앞의 문제와 뒤의 행동을 어떻게 이어 주는지 참고해 보세요.',
      },
      isUncertain: false,
      usedFallback: true,
    },
  },
  {
    id: 'a-new-student',
    scenarioNumber: 3,
    title: 'A New Student',
    subtitle: 'Scenario 3 · First morning in a high school classroom',
    beginning: 'A new student joins your class.',
    problem: 'The student looks nervous and sits alone.',
    endingIdea: 'You decide whether and how to talk to the student.',
    imageUrl: '/src/assets/images/scene_new_student_1795744794217.jpg',
    imageAlt:
      'Inside a sunlit Korean high school classroom before class, a new student sits nervously alone near the window while a classmate looks over kindly.',
    scenePromptQuestion:
      'Shape the story your own way. What did you notice about the new student, what did you decide to do, and what happened afterward?',
    level1Frames: [
      'This morning, a new student came to ___.',
      'The student looked ___, and nobody ___.',
      'I felt ___ because I remembered ___.',
      'Then, I decided to ___ and said ___.',
      'Finally, we ___ and the classroom felt ___.',
    ],
    level2Keywords: {
      questions: [
        'Who is the new student in your story?',
        'Where in the classroom did they sit?',
        'How did they look and what did you decide?',
        'What happened after you talked, and how did it end?',
      ],
      vocabulary: [
        'classroom',
        'nervous',
        'alone',
        'walked over',
        'introduced',
        'smiled',
        'comfortable',
        'friendly',
      ],
    },
    level3Connectors: ['First', 'At first', 'Then', 'After that', 'Because', 'So', 'Finally'],
    sampleParagraph:
      'On Monday morning, a new student joined our class right before homeroom. She sat alone at a desk near the window and looked nervous while everyone else talked with their friends. At first, I felt shy because I did not know what to say. Then, I remembered my own first day at a new school, so I picked up my notebook and walked over to her desk. I introduced myself and asked if she wanted to walk to the cafeteria together at lunch. Finally, she smiled with relief, and we spent the break talking about our favorite music.',
    fallbackHint: {
      focusCategory: 'Story organization · Sequence of events',
      targetSentence: '',
      praise: 'You showed real empathy and clear details about the classroom scene.',
      fix: 'Look closely at the highlighted part showing what happened next.',
      explanation:
        'Adding clear time words helps the reader follow the change from nervous silence to conversation.',
      question: 'Which sequence word like First, At first, Then, or Finally fits this moment?',
      whyExplanation:
        'Sequence markers guide the reader step by step through how a character notices a problem and takes action.',
      hint2:
        'Check the order between noticing the student and deciding to speak, and match the verb tense.',
      hint3Pattern: 'Time marker + past-tense action',
      hint3Example: 'At first, I felt shy. Then, I smiled and offered him a seat.',
      koreanHelp: {
        praise: '교실 상황과 인물의 감정에 대한 공감이 아주 잘 드러났어요.',
        fix: '강조된 부분에서 사건이 이어지는 순서를 살펴보세요.',
        explanation:
          '시간 순서 표현을 넣으면 긴장된 분위기에서 대화가 시작되는 변화를 독자가 쉽게 따라갈 수 있어요.',
        question: 'First, At first, Then, Finally 중 이곳의 흐름에 어울리는 표현은 무엇일까요?',
        whyExplanation:
          '순서 연결어는 인물이 문제를 발견하고 행동으로 옮기는 과정을 단계별로 보여 줍니다.',
        hint1: '강조된 부분 앞뒤의 사건이 어떤 순서로 일어나는지 확인해 보세요.',
        hint2: '학생을 본 순간과 말을 걸기로 한 순간의 순서 및 과거 시제를 살펴보세요.',
        hint3: '예문에서 "At first"와 "Then"이 감정의 변화를 어떻게 연결하는지 참고해 보세요.',
      },
      isUncertain: false,
      usedFallback: true,
    },
  },
];
