export const testQuestions = [
  // General conversation
  "Hello, how are you today?",
  "What's the weather like?",
  "Can you tell me a joke?",
  "What's your favorite color?",
  "How do you spend your free time?",
  
  // Technical questions
  "Explain machine learning in simple terms",
  "What is the difference between AI and ML?",
  "How does a neural network work?",
  "What is cloud computing?",
  "Explain blockchain technology",
  
  // Programming questions
  "Write a Python function to sort a list",
  "What is the difference between Python and JavaScript?",
  "How do you handle exceptions in programming?",
  "Explain object-oriented programming",
  "What are design patterns?",
  
  // Science questions
  "How does photosynthesis work?",
  "What causes gravity?",
  "Explain the theory of relativity",
  "What is DNA?",
  "How do vaccines work?",
  
  // History questions
  "Tell me about World War II",
  "Who was Napoleon Bonaparte?",
  "What caused the Industrial Revolution?",
  "Explain the Renaissance period",
  "What was the Cold War?",
  
  // Literature and arts
  "Who wrote Romeo and Juliet?",
  "What is abstract art?",
  "Explain the concept of metaphor",
  "Who painted the Mona Lisa?",
  "What is jazz music?",
  
  // Health and medicine
  "What are the benefits of exercise?",
  "How much water should I drink daily?",
  "What causes stress?",
  "Explain the immune system",
  "What is meditation?",
  
  // Food and cooking
  "How do you make pasta?",
  "What are the health benefits of vegetables?",
  "Explain fermentation",
  "What is umami?",
  "How do you bake bread?",
  
  // Travel and geography
  "What is the capital of France?",
  "Describe the Amazon rainforest",
  "What causes earthquakes?",
  "Tell me about Mount Everest",
  "What are the seven continents?",
  
  // Business and economics
  "What is supply and demand?",
  "Explain cryptocurrency",
  "What is a stock market?",
  "How does inflation work?",
  "What is entrepreneurship?",
  
  // Psychology and philosophy
  "What is consciousness?",
  "Explain cognitive bias",
  "What is the meaning of life?",
  "How does memory work?",
  "What is emotional intelligence?",
  
  // Mathematics
  "What is calculus?",
  "Explain probability theory",
  "What are prime numbers?",
  "How do you solve quadratic equations?",
  "What is statistics?",
  
  // Environment and nature
  "What is climate change?",
  "How do ecosystems work?",
  "What causes pollution?",
  "Explain renewable energy",
  "What is biodiversity?",
  
  // Sports and fitness
  "What are the rules of soccer?",
  "How do you build muscle?",
  "What is cardiovascular exercise?",
  "Explain the Olympics",
  "What is yoga?",
  
  // Technology trends
  "What is artificial intelligence?",
  "How does the internet work?",
  "What is virtual reality?",
  "Explain quantum computing",
  "What is 5G technology?",
  
  // Creative writing prompts
  "Write a short story about time travel",
  "Describe a perfect day",
  "Create a character for a novel",
  "Write a poem about nature",
  "Describe a futuristic city",
  
  // Problem-solving scenarios
  "How would you organize a large event?",
  "What would you do if you were stranded on an island?",
  "How do you resolve conflicts?",
  "Plan a budget for a small business",
  "Design a mobile app",
  
  // Educational content
  "Teach me about photosynthesis",
  "Explain the water cycle",
  "What is the periodic table?",
  "How do languages evolve?",
  "What is critical thinking?",
  
  // Current events and society
  "What is social media's impact on society?",
  "How has technology changed communication?",
  "What are human rights?",
  "Explain democracy",
  "What is globalization?",
  
  // Personal development
  "How do you set goals?",
  "What is time management?",
  "How do you build confidence?",
  "What is work-life balance?",
  "How do you learn new skills?",
  
  // Miscellaneous interesting topics
  "What would happen if gravity stopped working?",
  "How do dreams work?",
  "What is the universe made of?",
  "How do animals communicate?",
  "What is the future of humanity?"
]

export function getRandomQuestion(): string {
  return testQuestions[Math.floor(Math.random() * testQuestions.length)]
}

export function getQuestionByIndex(index: number): string {
  return testQuestions[index % testQuestions.length]
} 