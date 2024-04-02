//userId, notifTitle, notifContent

async function sendNotif (userId, notifTitle, notifContent) {
    try {
      await fetch("/notify", {
        method: "POST",
        body: JSON.stringify({
          userId: userId,
          notifTitle: notifTitle,
          notifContent: notifContent
        }),
        headers: { "Content-Type": "application/json" },
      }).then(res => {
        console.log(res);
        switch (res.status) {
          case 200: console.log("Yey"); break;
          case 400: alert("400: Bad Request"); break;
          case 500: alert("500: Internal Server Error"); break;
        }
      }).catch((err) => {
        console.log(err);
        alert("error");
      })
    } catch (err) {
      console.log(err);
    }
  }