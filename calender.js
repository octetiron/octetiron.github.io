console.log('Hello, World!');

function buttonClick() {
    alert('Hello');
}

const calculateCalender = (whatMonth, monthStartDay) => {
    const start = monthStartDay;
    const month = whatMonth;
    let calender = {};
    let lastDate;
    switch (month) {
        case 1:
            lastDate = 31;
        case 2:
            lastDate = 28;
        case 3:
            lastDate = 31;
        case 4:
            lastDate = 30;
        case 5:
            lastDate = 31;
        case 6:
            lastDate = 30;
        case 7:
            lastDate = 31;
        case 8:
            lastDate = 31;
        case 9:
            lastDate = 30;
        case 10:
            lastDate = 31;
        case 11:
            lastDate = 30;
        case 12:
            lastDate = 31;
    }
    let day = start - 1;
    for (let i = 1; i < lastDate; i++) {
        if (day === 7) day = 1;
        else day++;
        calender = { ...calender, [i]: day };
    }
    return calender;
};

console.log(calculateCalender(6, 5));
