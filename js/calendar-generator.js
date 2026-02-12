/**
 * GERADOR DE CALENDÁRIO MENSAL
 * JavaScript Principal - Funcionalidades Avançadas
 * Autor: Arquiteto Web Sênior
 * Última atualização: 2024
 */

'use strict';

/**
 * Classe principal para gerenciamento do calendário
 */
class CalendarGenerator {
    constructor() {
        this.config = {
            month: '',
            year: new Date().getFullYear(),
            daysInMonth: 30,
            startDay: 0, // 0 = Domingo
            colorPalette: 'auto',
            customColors: {
                primary: '#2563eb',
                secondary: '#64748b',
                accent: '#f59e0b'
            },
            backgroundImage: null,
            coverImage: null
        };

        this.months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        this.weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        this.colorThemes = {
            1: 'winter', // Janeiro
            2: 'winter', // Fevereiro
            3: 'spring', // Março
            4: 'spring', // Abril
            5: 'spring', // Maio
            6: 'summer', // Junho
            7: 'summer', // Julho
            8: 'summer', // Agosto
            9: 'autumn', // Setembro
            10: 'autumn', // Outubro
            11: 'autumn', // Novembro
            12: 'winter'  // Dezembro
        };

        this.init();
    }

    /**
     * Inicialização do aplicativo
     */
    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.updateFormFromConfig();
        this.setupColorPaletteListener();
    }

    /**
     * Vincula eventos aos elementos do DOM
     */
    bindEvents() {
        const form = document.getElementById('calendarConfigForm');
        const editBtn = document.getElementById('editBtn');
        const printBtn = document.getElementById('printBtn');
        const resetBtn = document.getElementById('resetBtn');
        const backgroundImageInput = document.getElementById('backgroundImage');
        const coverImageInput = document.getElementById('coverImage');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        editBtn.addEventListener('click', () => this.showConfigSection());
        printBtn.addEventListener('click', () => this.printCalendar());
        resetBtn.addEventListener('click', () => this.resetForm());
        
        backgroundImageInput.addEventListener('change', (e) => this.handleImageUpload(e, 'background'));
        coverImageInput.addEventListener('change', (e) => this.handleImageUpload(e, 'cover'));

        // Event listener para mudança de mês
        document.getElementById('month').addEventListener('change', () => {
            this.autoAdjustDaysInMonth();
        });
    }

    /**
     * Manipula o envio do formulário
     */
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        this.config = {
            ...this.config,
            month: formData.get('month'),
            year: parseInt(formData.get('year')),
            daysInMonth: parseInt(formData.get('daysInMonth')),
            startDay: parseInt(formData.get('startDay')),
            colorPalette: formData.get('colorPalette')
        };

        if (this.config.colorPalette === 'custom') {
            this.config.customColors = {
                primary: formData.get('primaryColor'),
                secondary: formData.get('secondaryColor'),
                accent: formData.get('accentColor')
            };
        }

        this.saveToLocalStorage();
        this.generateCalendar();
        this.showCalendarSection();
    }

    /**
     * Gera o calendário com base na configuração
     */
    generateCalendar() {
        this.applyTheme();
        this.renderCalendarHeader();
        this.renderCalendarGrid();
        this.renderCover();
    }

    /**
     * Aplica o tema de cores
     */
    applyTheme() {
        const body = document.body;
        
        // Remove temas anteriores
        Object.values(this.colorThemes).forEach(theme => {
            body.removeAttribute(`data-theme="${theme}"`);
        });
        body.removeAttribute('data-theme="spring"');
        body.removeAttribute('data-theme="summer"');
        body.removeAttribute('data-theme="autumn"');
        body.removeAttribute('data-theme="winter"');
        body.removeAttribute('data-theme="minimal"');
        body.removeAttribute('data-theme="vibrant"');
        body.removeAttribute('data-theme="corporate"');

        // Aplica novo tema
        if (this.config.colorPalette === 'auto') {
            const theme = this.colorThemes[this.config.month] || 'minimal';
            body.setAttribute('data-theme', theme);
        } else if (this.config.colorPalette !== 'custom') {
            body.setAttribute('data-theme', this.config.colorPalette);
        }

        // Aplica cores customizadas
        if (this.config.colorPalette === 'custom') {
            const root = document.documentElement;
            root.style.setProperty('--color-primary', this.config.customColors.primary);
            root.style.setProperty('--color-secondary', this.config.customColors.secondary);
            root.style.setProperty('--color-accent', this.config.customColors.accent);
        }
    }

    /**
     * Renderiza o cabeçalho do calendário
     */
    renderCalendarHeader() {
        const title = document.getElementById('calendarTitle');
        const month = document.getElementById('calendarMonth');
        const year = document.getElementById('calendarYear');
        const coverTitle = document.getElementById('coverTitle');
        const coverSubtitle = document.getElementById('coverSubtitle');

        const monthName = this.months[this.config.month - 1];
        const calendarTitle = `Calendário - ${monthName} ${this.config.year}`;
        
        title.textContent = calendarTitle;
        month.textContent = monthName;
        year.textContent = this.config.year;
        coverTitle.textContent = monthName;
        coverSubtitle.textContent = this.config.year;
    }

    /**
     * Renderiza a grade do calendário
     */
    renderCalendarGrid() {
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Adiciona dias vazios antes do primeiro dia do mês
        for (let i = 0; i < this.config.startDay; i++) {
            const emptyDay = this.createDayElement('', true);
            calendarDays.appendChild(emptyDay);
        }

        // Adiciona os dias do mês
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        for (let day = 1; day <= this.config.daysInMonth; day++) {
            const isToday = this.config.month === currentMonth && 
                           this.config.year === currentYear && 
                           day === currentDay;
            
            const dayElement = this.createDayElement(day, false, isToday);
            calendarDays.appendChild(dayElement);
        }
    }

    /**
     * Cria um elemento de dia
     */
    createDayElement(day, isEmpty = false, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = isEmpty ? '' : day;
        dayElement.setAttribute('aria-label', isEmpty ? '' : `Dia ${day}`);
        
        if (isEmpty) {
            dayElement.classList.add('empty');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // Adiciona classe para fins de semana
        if (!isEmpty) {
            const dayOfWeek = (this.config.startDay + day - 1) % 7;
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo ou Sábado
                dayElement.classList.add('weekend');
            }
        }

        return dayElement;
    }

    /**
     * Renderiza a capa do calendário
     */
    renderCover() {
        const cover = document.getElementById('calendarCover');
        const coverImage = document.getElementById('coverImageDisplay');
        
        if (this.config.coverImage) {
            cover.style.display = 'flex';
            coverImage.src = this.config.coverImage;
            coverImage.alt = `Imagem de capa para ${this.months[this.config.month - 1]}`;
        } else {
            cover.style.display = 'none';
        }

        // Aplica imagem de fundo
        const background = document.getElementById('calendarBackground');
        if (this.config.backgroundImage) {
            background.style.backgroundImage = `url(${this.config.backgroundImage})`;
            background.style.display = 'block';
        } else {
            background.style.display = 'none';
        }
    }

    /**
     * Manipula o upload de imagens
     */
    handleImageUpload(e, type) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, envie apenas arquivos de imagem.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (type === 'background') {
                this.config.backgroundImage = event.target.result;
            } else if (type === 'cover') {
                this.config.coverImage = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    /**
     * Configura o listener para paleta de cores
     */
    setupColorPaletteListener() {
        const colorPalette = document.getElementById('colorPalette');
        const customColorGroup = document.getElementById('customColorGroup');

        colorPalette.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customColorGroup.style.display = 'grid';
            } else {
                customColorGroup.style.display = 'none';
            }
        });
    }

    /**
     * Ajusta automaticamente os dias do mês
     */
    autoAdjustDaysInMonth() {
        const month = parseInt(document.getElementById('month').value);
        const year = parseInt(document.getElementById('year').value);
        
        if (month && year) {
            const daysInMonth = new Date(year, month, 0).getDate();
            document.getElementById('daysInMonth').value = daysInMonth;
        }
    }

    /**
     * Mostra a seção de configuração
     */
    showConfigSection() {
        document.getElementById('configSection').style.display = 'block';
        document.getElementById('calendarSection').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Mostra a seção do calendário
     */
    showCalendarSection() {
        document.getElementById('configSection').style.display = 'none';
        document.getElementById('calendarSection').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Imprime o calendário
     */
    printCalendar() {
        window.print();
    }

    /**
     * Redefine o formulário
     */
    resetForm() {
        document.getElementById('calendarConfigForm').reset();
        document.getElementById('year').value = new Date().getFullYear();
        document.getElementById('customColorGroup').style.display = 'none';
        
        // Limpa imagens
        this.config.backgroundImage = null;
        this.config.coverImage = null;
        document.getElementById('backgroundImage').value = '';
        document.getElementById('coverImage').value = '';
    }

    /**
     * Salva configuração no localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('calendarConfig', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Não foi possível salvar no localStorage:', error);
        }
    }

    /**
     * Carrega configuração do localStorage
     */
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('calendarConfig');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.config = { ...this.config, ...parsed };
            }
        } catch (error) {
            console.warn('Não foi possível carregar do localStorage:', error);
        }
    }

    /**
     * Atualiza o formulário com a configuração atual
     */
    updateFormFromConfig() {
        const form = document.getElementById('calendarConfigForm');
        
        Object.keys(this.config).forEach(key => {
            const element = form.elements[key];
            if (element) {
                if (key === 'customColors') {
                    // Lidar com cores customizadas
                    if (this.config.colorPalette === 'custom') {
                        document.getElementById('primaryColor').value = this.config.customColors.primary;
                        document.getElementById('secondaryColor').value = this.config.customColors.secondary;
                        document.getElementById('accentColor').value = this.config.customColors.accent;
                    }
                } else {
                    element.value = this.config[key];
                }
            }
        });

        // Mostra/esconde grupo de cores customizadas
        const customColorGroup = document.getElementById('customColorGroup');
        if (this.config.colorPalette === 'custom') {
            customColorGroup.style.display = 'grid';
        }
    }
}

/**
 * Inicialização quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', () => {
    new CalendarGenerator();
});

/**
 * Service Worker para funcionalidade offline (opcional)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}