import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';

const API_URL = 'http://127.0.0.1:8000/';
const APP_API_URL = 'http://127.0.0.1:8000/finaldraft/';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
export const login = async (username:string, password:string) => {

	try{
	const data = qs.stringify({username, password});
    const response = await axios.post(`${API_URL}auth/login/`, data , {
	  headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
	  },
	});
	if( response.data.message ){
		return { success: false, data : response.data.message };
	}
    return { success: true, data: response.data };
    }
	catch(error){
		console.log(error)
	}

};

export const logout = async () => {

  const csrfCookie = Cookies.get('csrftoken');
  try {
    const response = await axios.post(`${API_URL}auth/logout/`, {
	  headers: {
			'X-CSRFToken': csrfCookie,
	        'Content-Type': 'application/json',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Referrer-Policy': 'same-origin',
			'ALLOW':'GET , HEAD ,OPTIONS',
	  },
	});
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;
export const signup = async (username:string, password:string, email:string, first_name:string, last_name:string) => {

	try {
	const data = qs.stringify({username, password, email, first_name, last_name});
	const response = await axios.post(`${API_URL}auth/signup/`, data , {
			  headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
	  },
	});
	const return_data = {
		'username': response.data.username,
		'email':  response.data.email,
		'first_name':  response.data.first_name,
		'last_name':  response.data.last_name,
		'error': response.data.error,
	}
	if( return_data.error ){
		return {success: false, data: return_data};
	}
	return {success: true, data: return_data};
    }
	catch (error) {
		console.error('Error signing up:', error);
		throw error;
	}	
};

export const isAuthenticated = async () => {
	try{
		const response = await axios.get(`${API_URL}auth/isauthenticated/`, {
			withCredentials: true,
			headers: {
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			}
		});
		console.log(response.data);
		if (response.data.is_authenticated === true || 
            response.data.is_authenticated === 'true' || 
            response.data.is_authenticated === 'True' || 
            response.data.session_authenticated === true) {
            console.log('User is authenticated');
            return true;
        }
		else{
			return false;
		}
	}
	catch(error){
		console.error('Error checking authentication:', error);
        // Try the debug endpoint as a fallback
        try {
            const debugResponse = await axios.get(`${API_URL}debug/auth/`, {
                withCredentials: true
            });
            console.log('Debug auth response:', debugResponse.data);
            return debugResponse.data.is_authenticated === true;
        } catch (debugError) {
            console.error('Debug auth check also failed:', debugError);
            return false;
        }
	}
}


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

export const getAssignments = async () => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
	const response = await axios.get(`${APP_API_URL}users/assignments/`, {
		withCredentials: true,
	    headers: {
			'X-CSRFToken': csrfCookie,
	        'Content-Type': 'application/json',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Referrer-Policy': 'same-origin',
			'ALLOW':'GET , HEAD ,OPTIONS',
	    }	
	}) ;
	return response.data;
  } catch (error) {
	console.error('Error getting assignments:', error);
	throw error;
  }
}

export const getAssignmentDetails = async (assignmentId: string) => {
  const csrfCookie = Cookies.get('csrftoken');

  try {
    const response = await axios.get(`${APP_API_URL}assignment/` ,{
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrfCookie,
        'Content-Type': 'application/json',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Referrer-Policy': 'same-origin',
        'ALLOW': 'GET , HEAD ,OPTIONS',
      },
	  params: {
		 assignment_id: assignmentId,
	  }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting assignment details:', error);
    throw error;
  }
};

export const getSubtasks = async (assignmentId: string) => {
  const csrfCookie = Cookies.get('csrftoken');

  try {
	const response = await axios.get(`${APP_API_URL}assignment/subtasks/`, {
	  withCredentials: true,
	  headers: {
		'X-CSRFToken': csrfCookie,
		'Content-Type': 'application/json',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Referrer-Policy': 'same-origin',
		'ALLOW': 'GET , HEAD ,OPTIONS',
	  },
	  params: {
		assignment_id: assignmentId,
	  }
	});
	return response.data;
  } catch (error) {
	console.error('Error getting subtasks:', error);
	throw error;
  }
}

export const getAttachments = async (assignmentId: string) => {

	  const csrfCookie = Cookies.get('csrftoken');

	  try {
		const response = await axios.get(`${APP_API_URL}assignment/attachments/`, {
		  withCredentials: true,
		  headers: {
			'X-CSRFToken': csrfCookie,
			'Content-Type': 'application/json',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Referrer-Policy': 'same-origin',
			'ALLOW': 'GET , HEAD ,OPTIONS',
		  },
		  params: {
			assignment_id: assignmentId,
		  }
		});
		return response.data;
	  } catch (error) {
		console.error('Error getting attachments:', error);
		throw error;
	  }

}

export const getGroups = async () => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
	const response = await axios.get(`${APP_API_URL}users/groups/`, {
		withCredentials: true,
	    headers: {
			'X-CSRFToken': csrfCookie,
	        'Content-Type': 'application/json',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Referrer-Policy': 'same-origin',
			'ALLOW':'GET , HEAD ,OPTIONS',
	    }	
	}) ;
	return response.data;
  } catch (error) {
	console.error('Error getting groups:', error);
	throw error;
  }
}

export const getGroupMembers = async (groupId: number) => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
	const response = await axios.get(`${APP_API_URL}group/members/`, {
		withCredentials: true,
	    headers: {
			'X-CSRFToken': csrfCookie,
	        'Content-Type': 'application/json',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Referrer-Policy': 'same-origin',
			'ALLOW':'GET , HEAD ,OPTIONS',
	    },
		params: {
			group_id: groupId,
		}	
	}) ;
	return response.data;
  } catch (error) {
	console.error('Error getting group members:', error);
	throw error;
  }
}

export const getSelfProfile = async () => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
	const response = await axios.get(`${APP_API_URL}user/profile/self/`, {
		withCredentials: true,
	    headers: {
			'X-CSRFToken': csrfCookie,
	        'Content-Type': 'application/json',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Referrer-Policy': 'same-origin',
			'ALLOW':'GET , HEAD ,OPTIONS',
	    }	
	}) ;
	return response.data;
  } catch (error) {
	console.error('Error getting self profile:', error);
	throw error;
  }
}

export const getAllReviewees = async () => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
		const response = await axios.get(`${APP_API_URL}users/reviewees/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			}
		}) ;
		return response.data;
	} catch (error) {
		console.error('Error getting reviewees:', error);
		throw error;
	}
}

export const getAllReviewers = async () => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
		const response = await axios.get(`${APP_API_URL}users/reviewers/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			}
		}) ;
		return response.data;
	} catch (error) {
		console.error('Error getting reviewers:', error);
		throw error;
	}
}

export const createAssignment = async (title: string, description: string, unformatted_deadline: string, reviewee_users: number[], reviewee_groups: number[], reviewer_users: number[] , sendToMail : boolean) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const date = new Date().toISOString().split('T')[0];
		const deadline = new Date(unformatted_deadline).toISOString().split('T')[0];
	    const data = new FormData();
	    data.append('title', title);
	    data.append('description', description);
	    data.append('deadline', deadline);
	    data.append('date', date);
	    data.append('reviewee_users', JSON.stringify(reviewee_users));
	    data.append('reviewee_groups', JSON.stringify(reviewee_groups));
	    data.append('reviewer_users', JSON.stringify(reviewer_users));
		data.append('send_to_mail' , sendToMail.toString());

		console.log(data);

		const response = await axios.post(`${APP_API_URL}assignment/` , data ,{
				withCredentials: true,
				headers: {
					'X-CSRFToken': csrfCookie,
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cross-Origin-Opener-Policy': 'same-origin',
					'Referrer-Policy': 'same-origin',
					'ALLOW': 'POST , OPTIONS',
				},
		});
		return response.data;
	}
	catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
    }
}

export const deleteAssignment = async (assignmentId: number) => {

	const csrfCookie = Cookies.get('csrftoken');

	try{
		const response = await axios.delete(`${APP_API_URL}assignment/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW': 'DELETE , OPTIONS',
			},
			params: {
				assignment_id: assignmentId,
			}
		});
	}
	catch(error){
		console.error('Error deleting assignment:', error);
		throw error;
	}

}

export const addSubtask = async (assignmentId: number, title: string, unformatted_deadline: string) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const deadline = new Date(unformatted_deadline).toISOString().split('T')[0];
		const date = new Date().toISOString().split('T')[0];
		const data = {
			assignment_id: assignmentId,
			title:title,
			deadline:deadline,
			date:date,
		}

		const response = await axios.post(`${APP_API_URL}assignment/subtasks/`, data ,{
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
			},
		});
		return response.data;
	}
	catch (error) {
	console.error('Error creating subtask:', error);
	throw error;
	}
}

export const addAttachment = async (assignmentId: number, image: File|null , file: File|null ) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const data = new FormData();
		data.append('assignment_id', assignmentId.toString());
		if (image) {
			data.append('image', image);
		}
		if (file) {
			data.append('file', file);
		}

		const response = await axios.post(`${APP_API_URL}assignment/attachments/` , data ,{
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	}
	catch (error) {
	console.error('Error adding attachment:', error);
	throw error;
	}
}

export const getMemberStatus = async (assignmentId: number) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const response = await axios.get(`${APP_API_URL}assignment/users/status/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params: {
				assignment_id: assignmentId,
			}
		});
		return response.data;
	}
	catch (error) {
		console.error('Error getting member status:', error);
		throw error;
	}
}

export const getAssignmentReviewers = async (assignmentId: number) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const response = await axios.get(`${APP_API_URL}assignment/users/reviewers/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params: {
				assignment_id: assignmentId,
			}
		});
		return response.data;
	}
	catch (error) {
		console.error('Error getting assignment reviewers:', error);
		throw error;
	}
}

export const getSubmissions = async ( assignmentId : number) => {

	const csrfCookike = Cookies.get('csrftoken');
	
	try{

		const response = await axios.get(`${APP_API_URL}assignment/submissions/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookike,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params: {
				assignment_id: assignmentId,
			}
		});
		return response.data;

	}
	catch(error){
		console.error('Error getting submissions:', error);
		throw error;
	}

}

export const getUsernames = async (user_ids: number[]) => {
	const csrfCookie = Cookies.get('csrftoken');

	try {
		const response = await axios.get(`${APP_API_URL}users/usernames/`, {
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params: {
				user_ids: JSON.stringify(user_ids),
			}
		});
		console.log(JSON.stringify(user_ids))
		return response.data;
	}
	catch (error) {
		console.error('Error getting usernames:', error);
		throw error;
	}
}

export const submitAssignment = async (assignmentId: number, repoLink: string, subtask_ids: number[], remark: string, reviewee_ids: number[], reviewer_ids: number[]) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const data = {
			assignment_id: assignmentId,
			repo_link: repoLink,
			subtask_ids: subtask_ids,
			remark: remark,
			reviewee_ids: reviewee_ids,
			reviewer_ids: reviewer_ids,
		}

		const response = await axios.post(`${APP_API_URL}assignment/users/submissions/`, data ,{
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
			},
		});
		return response.data;
	}
	catch (error) {
	console.error('Error submitting assignment:', error);
	throw error;
	}

}

export const addSubmissionAttachment = async (subtask_id: number, image: File|null , file: File|null ) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		const data = new FormData();
		data.append('submission_id', subtask_id.toString());
		if (image) {
			data.append('image', image);
		}
		if (file) {
			data.append('file', file);
		}

		const response = await axios.post(`${APP_API_URL}assignment/submissions/attachments/` , data ,{
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	}
	catch (error) {
	console.error('Error adding attachment:', error);
	throw error;
	}

}

export const getSubmissionDetails = async (submissionId: number) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {

		const response = await axios.get(`${APP_API_URL}assignment/users/submissions/`, {
			
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params: {
				submission_id: submissionId,
			}
		});
		return response.data;

	}
	catch(error){
		console.error('Error getting submission details:', error);
		throw error;
	}

}

export const getAttachmentURL = async ( attachmentId:number) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {

		const response = await axios.get(`${APP_API_URL}attachments/uri/`, {
			
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params: {
				attachment_id: attachmentId ,
			}
		});
		return response.data.url;

	}
	catch(error){
		console.error('Error getting attachment URL:', error);
		throw error;
	}
}

export const submitReview = async( submission_id:number , is_completed:string , completed_subtasks:number[] ) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		
		const data = {
				submission_id: submission_id,
				is_completed: is_completed,
				completed_subtasks: JSON.stringify(completed_subtasks),
		}

		const response = await axios.post(`${APP_API_URL}assignment/submissions/edit/`, data ,{
			
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'multipart/form-data',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
		});
		return response.status;

	}
	catch(error){
		console.error('Error getting attachment URL:', error);
		throw error;
	} 

}

export const getUserInfo = async (userId: number) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		
		const response = await axios.get(`${APP_API_URL}users/userinfo/` ,{
			
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params:{
				user_id: userId,
			}
		});
		return response.data;

	}
	catch(error){
		console.error('Error getting user data:', error);
		throw error;
	} 

}

export const getComments = async ( submissionId:number ) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		
		const response = await axios.get(`${APP_API_URL}assignment/submissions/comments/` ,{
			
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'application/json',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'GET , HEAD ,OPTIONS',
			},
			params:{
				submission_id: submissionId,
			}
		});
		return response.data;

	}
	catch(error){
		console.error('Error getting comments:', error);
		throw error;
	} 

}

export const addComment = async ( submissionId:number , content:string ) => {

	const csrfCookie = Cookies.get('csrftoken');

	try {
		
		const data = {
			submission_id: submissionId,
			content: content,
		}

		const response = await axios.post(`${APP_API_URL}assignment/submissions/comments/` , data ,{
			
			withCredentials: true,
			headers: {
				'X-CSRFToken': csrfCookie,
				'Content-Type': 'multipart/form-data',
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Referrer-Policy': 'same-origin',
				'ALLOW':'POST , HEAD ,OPTIONS',
			},
		});
		return response.data;

	}
	catch(error){
		console.error('Error adding comment:', error);
		throw error;
	} 

}