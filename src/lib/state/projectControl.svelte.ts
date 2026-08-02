import type { ProjectDetails } from '$lib/types/Project';

class ProjectControlState {
	/** Whether the project detail is currently visible. */
	public isVisible = $state<boolean>(false);
	/** Index of the active project. */
	public index = $state<number>(-1);
	/** Active project data. */
	public data = $state<ProjectDetails | null>(null);

	/**
	 * Sets the active project.
	 *
	 * @param index Active project index.
	 * @param project Active project data.
	 */
	set(index: number, project: ProjectDetails | null) {
		this.index = index;
		this.data = project;
	}

	/**
	 * Controls the visibility of the active project.
	 *
	 * @param visible Visibility state.
	 */
	show(visible = true) {
		this.isVisible = visible;
	}

	/** Hides the active project. */
	hide() {
		this.isVisible = false;
	}

	/** Clears the active project state. */
	reset() {
		this.isVisible = false;
		this.index = -1;
		this.data = null;
	}
}

export const projectControl = new ProjectControlState();
