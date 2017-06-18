const Redis = require('ioredis');
const Widget = require('../models/Widget');

class WidgetRepository {
    constructor() {
        this.redis = new Redis();
    }

    /**
     * @return {Promise.<*>}
     */
    getLastID() {
        return this.redis.get('last_id')
    }

    setLastID(id) {
        this.redis.set('last_id', id)
    }

    /**
     * @return {Promise.<Array<Widget>>}
     */
    async findAll() {
        let list = await this.redis.get('list')
        list = JSON.parse(list) || []
        list = list.filter(n => n)
        list = list.map((widgetData) => {
            const widget = new Widget()
            widget.id = widgetData.id
            widget.city = widgetData.city
            widget.period = widgetData.period
            widget.position = widgetData.position

            return widget
        })
        list.sort((prev, next) => {
            return prev.id > next.id ? -1 : 1
        })

        return list
    }

    /**
     * @return {Promise.<Widget>}
     */
    async findById(id) {
        const list = await this.findAll()
        const filtered = list.filter((widget) => { return widget.id === id })
        return filtered ? filtered[0] : null
    }

    async save(widget) {
        const list = await this.findAll()
        if (widget.id) {
            const filtered = list.filter((item) => {
                return item.id === widget.id
            })
            if (filtered) {
                const index = list.indexOf(filtered[0])
                delete list[index]
            } else {
                throw new Error('no id');
            }
        } else {
            let lastID = await this.getLastID()
            lastID = lastID || 0
            ++lastID
            widget.id = lastID
            this.setLastID(widget.id)
        }
        list.push(widget)
        this.redis.set('list', JSON.stringify(list))
    }
}

module.exports = WidgetRepository