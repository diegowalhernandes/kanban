let cardId = 1;
let draggedCard = null;
let currentEditingCard = null;

function addCard() {
    const titleInput = document.getElementById('cardTitle');
    const descriptionInput = document.getElementById('cardDescription');
    const dueDateInput = document.getElementById('cardDueDate');
    
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const dueDate = dueDateInput.value;

    if (title === '') {
        alert('Por favor, digite um título para a tarefa!');
        return;
    }

    const card = createCard(cardId++, title, description, dueDate);
    const todoCards = document.getElementById('todoCards');
    
    // Remove empty state se existir
    const emptyState = todoCards.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    todoCards.appendChild(card);
    titleInput.value = '';
    descriptionInput.value = '';
    dueDateInput.value = '';
    updateCounters();

    // Animação de entrada
    card.style.opacity = '0';
    card.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 10);
}

function createCard(id, title, description, dueDate) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.id = `card-${id}`;
    
    // Armazenar dados no elemento
    card.dataset.title = title;
    card.dataset.description = description;
    card.dataset.dueDate = dueDate;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const descriptionHTML = description ? 
        `<div class="card-description">${description}</div>` : 
        `<div class="card-description empty">Sem descrição</div>`;

    let dueDateHTML = '';
    if (dueDate) {
        const dueDateObj = new Date(dueDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDateObj.setHours(0, 0, 0, 0);
        
        let dueDateClass = '';
        if (dueDateObj < today) {
            dueDateClass = 'overdue';
        } else if (dueDateObj.getTime() === today.getTime()) {
            dueDateClass = 'today';
        }
        
        dueDateHTML = `<div class="card-due-date ${dueDateClass}">📅 Entrega: ${dueDateObj.toLocaleDateString('pt-BR')}</div>`;
    }

    card.innerHTML = `
        <button class="delete-btn" onclick="deleteCard('${card.id}')" title="Excluir tarefa">×</button>
        <div class="card-title" onclick="openCardModal('${card.id}')">${title}</div>
        ${descriptionHTML}
        ${dueDateHTML}
        <div class="card-meta">
            <span class="card-date">📝 Criado em ${dateStr} às ${timeStr}</span>
        </div>
    `;

    card.ondragstart = drag;
    card.ondragend = dragEnd;

    return card;
}

function openCardModal(cardId) {
    const card = document.getElementById(cardId);
    currentEditingCard = card;
    
    document.getElementById('modalTitle').value = card.dataset.title;
    document.getElementById('modalDescription').value = card.dataset.description;
    document.getElementById('modalDueDate').value = card.dataset.dueDate;
    
    document.getElementById('cardModal').classList.add('active');
}

function closeModal() {
    document.getElementById('cardModal').classList.remove('active');
    currentEditingCard = null;
}

function saveCard() {
    if (!currentEditingCard) return;
    
    const title = document.getElementById('modalTitle').value.trim();
    const description = document.getElementById('modalDescription').value.trim();
    const dueDate = document.getElementById('modalDueDate').value;
    
    if (title === '') {
        alert('Por favor, digite um título para a tarefa!');
        return;
    }
    
    // Atualizar dados do card
    currentEditingCard.dataset.title = title;
    currentEditingCard.dataset.description = description;
    currentEditingCard.dataset.dueDate = dueDate;
    
    // Recriar o HTML do card
    const descriptionHTML = description ? 
        `<div class="card-description">${description}</div>` : 
        `<div class="card-description empty">Sem descrição</div>`;

    let dueDateHTML = '';
    if (dueDate) {
        const dueDateObj = new Date(dueDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDateObj.setHours(0, 0, 0, 0);
        
        let dueDateClass = '';
        if (dueDateObj < today) {
            dueDateClass = 'overdue';
        } else if (dueDateObj.getTime() === today.getTime()) {
            dueDateClass = 'today';
        }
        
        dueDateHTML = `<div class="card-due-date ${dueDateClass}">📅 Entrega: ${dueDateObj.toLocaleDateString('pt-BR')}</div>`;
    }

    const cardMeta = currentEditingCard.querySelector('.card-meta').outerHTML;
    
    currentEditingCard.innerHTML = `
        <button class="delete-btn" onclick="deleteCard('${currentEditingCard.id}')" title="Excluir tarefa">×</button>
        <div class="card-title" onclick="openCardModal('${currentEditingCard.id}')">${title}</div>
        ${descriptionHTML}
        ${dueDateHTML}
        ${cardMeta}
    `;
    
    closeModal();
}

function deleteCard(cardId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        const card = document.getElementById(cardId);
        card.style.transform = 'scale(0)';
        card.style.opacity = '0';
        setTimeout(() => {
            card.remove();
            updateCounters();
            updateEmptyStates();
        }, 300);
    }
}

function drag(ev) {
    draggedCard = ev.target;
    ev.target.classList.add('dragging');
}

function dragEnd(ev) {
    ev.target.classList.remove('dragging');
    draggedCard = null;
}

function allowDrop(ev) {
    ev.preventDefault();
    const column = ev.currentTarget;
    column.classList.add('drag-over');
}

function drop(ev) {
    ev.preventDefault();
    const column = ev.currentTarget;
    column.classList.remove('drag-over');
    
    if (draggedCard) {
        const cardsContainer = column.querySelector('.cards-container');
        
        // Remove empty state se existir
        const emptyState = cardsContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        cardsContainer.appendChild(draggedCard);
        updateCounters();
        updateEmptyStates();
        
        // Animação de drop
        draggedCard.style.transform = 'scale(1.05)';
        setTimeout(() => {
            draggedCard.style.transform = 'scale(1)';
        }, 200);
    }
}

function updateCounters() {
    const todoCount = document.getElementById('todoCards').children.length;
    const progressCount = document.getElementById('progressCards').children.length;
    const doneCount = document.getElementById('doneCards').children.length;

    document.getElementById('todoCounter').textContent = todoCount;
    document.getElementById('progressCounter').textContent = progressCount;
    document.getElementById('doneCounter').textContent = doneCount;
}

function updateEmptyStates() {
    const containers = ['todoCards', 'progressCards', 'doneCards'];
    const messages = ['Nenhuma tarefa ainda', 'Nenhuma tarefa em progresso', 'Nenhuma tarefa concluída'];

    containers.forEach((containerId, index) => {
        const container = document.getElementById(containerId);
        const hasCards = container.querySelector('.card') !== null;
        const hasEmptyState = container.querySelector('.empty-state') !== null;

        if (!hasCards && !hasEmptyState) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = messages[index];
            container.appendChild(emptyState);
        }
    });
}

// Event listeners
document.getElementById('cardTitle').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('cardDescription').focus();
    }
});

document.getElementById('cardDescription').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        addCard();
    }
});

// Fechar modal clicando fora dele
window.onclick = function(event) {
    const modal = document.getElementById('cardModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Remove drag-over class when leaving column
document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragleave', function(e) {
        if (!this.contains(e.relatedTarget)) {
            this.classList.remove('drag-over');
        }
    });
});

// Initialize counters
updateCounters();