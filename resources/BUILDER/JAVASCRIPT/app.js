
$(document).ready(function () {
    var selector = document.getElementById('draw-calendar')
    if (selector) {
        var insatnceCalendar = new Calendar();

        var eventDefault = {
            '2020': {
                '01': {
                    '07': [
                        { 'start': '09:00', 'end': '14:00', 'type': 'ahihi', 'memo': 'dfg hjhf dgfj dgb fdj  gb jg' }
                    ]
                },
                '04': {
                    '14': [
                        { 'start': '06:00', 'end': '17:00', 'type': '面接', 'memo': 'dfg hjhf dgfj dgb fdj  gb jg' }
                    ]
                }
            }
        };
        insatnceCalendar.setLabelDays(["日", "月", "火", "水", "木", "金", "土"]);
        insatnceCalendar.setLabelYear('年');
        insatnceCalendar.setLabelMonth('月');
        insatnceCalendar.setLabelModalHeader("スケジュール");
        insatnceCalendar.setEventDefault(eventDefault);
        insatnceCalendar.setElementDraw(selector);

        insatnceCalendar.draw();
    }
})