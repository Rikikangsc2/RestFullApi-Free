const fetch = require("@replit/node-fetch");
const { DateTime } = require("luxon");

async function get(hari) {
  try {
    const currentDate = DateTime.now().setZone(hari);
    const newYearDate = DateTime.local(currentDate.year + 1, 1, 1).setZone(hari);
    const timeDifference = newYearDate.diff(currentDate).as("days");

    const formatDate = (date, format) => date.toFormat(format, { locale: 'id' });

    const response = await fetch('https://nue-api.vercel.app/api/acara');
    const acaraList = await response.json();
    const now = DateTime.now().setZone(hari);
    const upcomingEvents = acaraList.filter(event => DateTime.fromISO(event.tanggal, { zone: hari }) >= now).sort((a, b) => DateTime.fromISO(a.tanggal, { zone: hari }) - DateTime.fromISO(b.tanggal, { zone: hari }));

    const formatEventDate = (date) => formatDate(date, 'd LLLL yyyy');

    if (upcomingEvents.length > 0) {
      const nearestEvent = upcomingEvents[0];
      const { keterangan, tanggal } = nearestEvent;
      const daysToEvent = Math.ceil(DateTime.fromISO(tanggal, { zone: hari }).diff(currentDate, 'days').days);

      const info = {
        today: {
          formattedDate: formatDate(currentDate, 'd LLLL yyyy'),
          day: formatDate(currentDate, 'EEEE'),
          daysToNewYear: Math.floor(timeDifference),
          currentTime: formatDate(currentDate, 'HH:mm'),
        },
        upcomingEvent: {
          Information: keterangan,
          formattedEventDate: formatEventDate(DateTime.fromISO(tanggal, { zone: hari })),
          day: formatDate(DateTime.fromISO(tanggal, { zone: hari }), 'EEEE'),
          daysToEvent,
        },
      };

      const template = `Hari ini tanggal *${info.today.formattedDate}* (${info.today.day}) pukul *${info.today.currentTime}* WIB. Akan ada acara *${keterangan}* dalam waktu *${daysToEvent} hari* lagi, tepatnya pada tanggal *${info.upcomingEvent.formattedEventDate}* (${info.upcomingEvent.day}). Oh yaa, gak kerasa ya *${info.today.daysToNewYear} hari* lagi Tahun baru 🤧`;

      return { info, template };
    } else {
      const info = {
        today: {
          formattedDate: formatDate(currentDate, 'd LLLL yyyy'),
          day: formatDate(currentDate, 'EEEE'),
          daysToNewYear: Math.floor(timeDifference),
          currentTime: formatDate(currentDate, 'HH:mm'),
        },
        upcomingEvent: null,
      };

      const template = `Hari ini tanggal *${info.today.formattedDate}* (${info.today.day}) pukul *${info.today.currentTime}* WIB. Akan ada acara dalam waktu *${info.today.daysToNewYear} hari* lagi. Tidak ada informasi acara mendekati.`;

      return { info, template };
    }
  } catch (error) {
    return { error: "Gagal mendapatkan informasi acara atau hitung mundur." };
  }
}

module.exports = { get };
