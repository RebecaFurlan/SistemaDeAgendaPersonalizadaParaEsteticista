//campo data ajuda do chatgpt
$(function () {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Define a data mínima como sendo o dia atual
      const minDate = new Date(currentYear, currentMonth, today.getDate());

      $("#datepicker").datepicker({
        beforeShowDay: function (date) {
          // Verifique se a data é um domingo (0) ou sábado (6)
          var day = date.getDay();
          return [day !== 0, ''];
        },
        minDate: minDate // Impede que o usuário selecione datas anteriores ao dia atual

      });

      // Validação do lado do cliente para garantir que a data não seja anterior ao dia atual
      const dataInput = $("#datepicker");

      dataInput.on('change', function () {
        const selectedDate = new Date(dataInput.val());
        if (selectedDate < minDate) {
          alert('A data selecionada não pode ser anterior ao dia atual.');
          dataInput.val(''); // Limpa o campo de data
        }
      });

      // Validação antes de enviar o formulário
      $("#agendamentoForm").on('submit', function (e) {
        const selectedDate = new Date(dataInput.val());
        const selectedDay = selectedDate.getDay();

        if (selectedDate < minDate || selectedDay === 0) {
          e.preventDefault(); // Impede o envio do formulário
          if (selectedDay === 0) {
            alert('Você não pode agendar para um domingo.');
          } else {
            alert('Você não pode agendar para uma data anterior ao dia atual.');
          }
        }
      });
    });

    