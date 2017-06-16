class Widget {
    constructor() {
        this.id = null
        this.city = null
        this.period = null
        this.position = null
    }

    get cityTitle () {
        return Widget.allowedCities()[this.city]
    }

    get positionTitle () {
        return Widget.allowedPositions()[this.position]
    }

    static allowedCities() {
        return ['Москва', 'Санкт-Петербург', 'Нижний Новгород']
    }
    static allowedPeriods() {
        return [1, 3, 7]
    }
    static allowedPositions() {
        return ['Горизонтально', 'Вертикально']
    }
}

module.exports = Widget