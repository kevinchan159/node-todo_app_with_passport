$(document).ready(function() {
	$('.editTask').on('click', function() {
		console.log('clicked button');
		var id = $(this).data('id');
		var title = $(this).data('title');
		var description = $(this).data('description');
		$('#editTaskId').val(id);
		$('#editTaskTitle').val(title);
		$('#editTaskDescription').val(description);
	});
});