let socket: WebSocket;

function startGame() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const button = document.getElementById('playButton') as HTMLButtonElement;
  canvas.style.display = 'block';
  button.style.display = 'none';

  socket = new WebSocket('ws://localhost:3001/ws');

  socket.onmessage = (event) => {
    const state = JSON.parse(event.data);
    render(state);
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      socket.send(JSON.stringify({ type: 'move', direction: 'up' }));
    } else if (e.key === 'ArrowDown') {
      socket.send(JSON.stringify({ type: 'move', direction: 'down' }));
    }
  });
}

function render(state: any) {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.fillRect(10, state.playerPaddleY, 10, 100); // Player paddle
  ctx.fillRect(780, state.computerPaddleY, 10, 100); // Computer paddle

  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '30px Arial';
  ctx.fillText(state.playerScore.toString(), 100, 50);
  ctx.fillText(state.computerScore.toString(), 700, 50);
}

document.getElementById('playButton')!.addEventListener('click', startGame);