# Reviva 🧩

Reviva é um jogo de palavras cruzadas interativo e dinâmico, projetado para oferecer uma experiência de quebra-cabeças imersiva em dispositivos móveis. Focado em acessibilidade, usabilidade fluida e com uma identidade visual acolhedora.

## 🚀 Funcionalidades

- **Múltiplos Níveis:** Um sistema de progressão através de fases.
- **Dicas Dinâmicas:** Slider de dicas integrado para ajudar durante a resolução, com transições suaves e dicas graduais que revelam letras ao longo do tempo.
- **Trilha Sonora e Efeitos:** Sistema de música de fundo em formato playlist (toca automaticamente arquivos de temas) com efeito de "ducking" automático (o volume abaixa durante a reprodução de efeitos sonoros como vitórias ou acertos).
- **Rolagem Automática (Auto-Scroll):** A grade de palavras e o teclado virtual acompanham as linhas ativas e reveladas sem a necessidade de o usuário rolar manualmente pela tela.
- **Animações Fluidas:** Respostas, digitação e interações acompanham pequenos feedbacks visuais.

## 🛠 Tecnologias e Ferramentas

O projeto foi construído utilizando o ecossistema mais moderno para desenvolvimento mobile multiplataforma:

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) (Framework Principal)
- [Expo Router](https://docs.expo.dev/router/introduction/) (Navegação baseada em arquivos - *File-based routing*)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/audio/) (Gerenciamento de áudios e efeitos sonoros)
- [TypeScript](https://www.typescriptlang.org/) (Tipagem estática segura)
- [React Native Reanimated / Animated] (Para as transições de tela e dicas)

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas na sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Opcional, porém recomendado: Aplicativo **Expo Go** instalado no seu dispositivo móvel ([iOS](https://apps.apple.com/us/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

## 🎮 Como executar o projeto localmente

Siga os passos abaixo para clonar e rodar o aplicativo no seu ambiente local:

1. **Clone o repositório ou acesse a pasta do projeto:**
   ```bash
   cd Reviva
   ```

2. **Instale as dependências:**
   Usando npm:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento do Expo:**
   ```bash
   npx expo start --tunnel
   ```

4. **Abra o aplicativo:**
   - **No Celular:** Abra o aplicativo **Expo Go**, escaneie o QR Code que aparecerá no terminal (para Android) ou na câmera padrão (para iOS).
   - **No Emulador:** Pressione `a` no terminal para rodar no Android Emulator, ou `i` para rodar no iOS Simulator.

## 📁 Estrutura de Pastas e Arquivos

O projeto utiliza o **Expo Router**, então o roteamento de telas reflete a árvore de diretórios em `/app`:

- `/app`: Telas da aplicação (rotas).
  - `_layout.tsx`: O layout raiz (onde também mora o controlador de música ambiente).
  - `index.tsx`: Tela de boas vindas inicial.
  - `/levels.tsx`: Seleção de fases e níveis.
  - `/game/[id].tsx`: Tela principal em que a "Fase" ou "Jogo" realmente acontece.
- `/assets`: Recursos estáticos (Sons, imagens, ícones).
  - `/assets/sounds`: Aqui estão arquivos `.mp3`. Arquivos como `theme_1.mp3`, `theme_2.mp3` são captados automaticamente para a trilha sonora.
- `/components`: Componentes reutilizáveis (Header, ClueBanner, CrosswordGrid, Keyboard).
- `/constants`: Tokens de design (cores, tipografia) e base de dados estática do jogo (`puzzleData.ts`).
- `/hooks`: Lógica de gerenciamento de estado encapsulada. O `useGameState.ts` é o "cérebro" que gerencia a fase.

## 🎵 Sobre a Trilha Sonora

Você pode facilmente adicionar novas músicas de fundo ao jogo:
Basta adicionar novos arquivos em `assets/sounds/` nomeando-os como `theme_2.mp3`, `theme_3.mp3` e assim por diante. O jogo carregará a lista na ordem numérica e reproduzirá os temas infinitamente como uma playlist de forma totalmente automática.
