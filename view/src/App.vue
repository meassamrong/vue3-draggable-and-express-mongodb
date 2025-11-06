<template>
  <div class="task-list-container">
    <form @submit.prevent="createTask">
      <input v-model="newTaskContent" placeholder="Add a new task" />
      <button type="submit">Add</button>
    </form>

    <VueDraggable
      v-model="tasks"
      class="list-group"
      :animation="150"
      handle=".handle"
      @end="onDragEnd"
    >
      <div v-for="task in tasks" :key="task._id" class="list-item">
        <span class="handle">⠿</span>

        <input
          v-model="task.content"
          @blur="updateTask(task)"
          class="task-content"
        />

        <button @click="deleteTask(task._id)" class="delete-btn">×</button>
      </div>
    </VueDraggable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import axios from 'axios'; // For making API calls

// The 'tasks' ref is our local "source of truth".
// v-model in VueDraggable will automatically update its order.
const tasks = ref([]);
const newTaskContent = ref('');
const API_URL = 'http://localhost:3000/api/tasks';

// --- CRUD Functions ---

// 1. READ (on component mount)
onMounted(async () => {
  try {
    const { data } = await axios.get(API_URL);
    tasks.value = data; // Already sorted by the API
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
});

// 2. CREATE
const createTask = async () => {
  if (!newTaskContent.value.trim()) return;
  try {
    console.log('Task content.', newTaskContent.value,)
    const { data } = await axios.post(API_URL, {
      content: newTaskContent.value,
    });
    tasks.value.push(data); // Add new task to the end of the list
    newTaskContent.value = '';
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

// 3. UPDATE (on blur)
const updateTask = async (task) => {
  try {
    await axios.patch(`${API_URL}/${task._id}`, {
      content: task.content,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    // Note: You might want to reload tasks here if the update fails
  }
};

// 4. DELETE
const deleteTask = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    tasks.value = tasks.value.filter(task => task._id !== id);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

// --- ⭐ THE DRAGGABLE LOGIC ⭐ ---

const onDragEnd = async (event) => {
  // `tasks.value` is already updated locally by v-model
  const { newIndex } = event;

  // Get the item that was just moved
  const movedItem = tasks.value[newIndex];

  // 1. Find the order of the items *around* it
  const itemBefore = tasks.value[newIndex - 1];
  const itemAfter = tasks.value[newIndex + 1];

  // 2. Determine the order values
  // If it's at the start, use 0
  const orderBefore = itemBefore ? itemBefore.order : 0;

  // If it's at the end, just add to the last item's order
  // (Using 1000 as a "gap" is arbitrary but easy)
  const orderAfter = itemAfter ? itemAfter.order : (orderBefore + 1000);

  // 3. Calculate the new order
  const newOrder = (orderBefore + orderAfter) / 2;

  // 4. Update the item's order locally (for reactivity)
  movedItem.order = newOrder;

  try {
    // 5. Send the ONE update to the backend
    await axios.patch(`${API_URL}/${movedItem._id}`, {
      order: newOrder,
    });
  } catch (error) {
    console.error('Error saving new order:', error);
    // You should probably reload all tasks here to be safe
  }
};
</script>

<style scoped>
/* Basic styling to make it look decent */
.list-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f4f4f4;
  margin-bottom: 5px;
  border-radius: 4px;
}
.handle {
  cursor: grab;
  margin-right: 10px;
  font-weight: bold;
}
.task-content {
  flex-grow: 1;
  border: none;
  background: transparent;
}
.delete-btn {
  margin-left: 10px;
  background: #ff4d4d;
  border: none;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
