import { TestBed, ComponentFixture } from "@angular/core/testing";
import { SearchPageComponent } from "./search-page.component";
import { GithubService } from '../../services/github.service'; 
import { HttpClientModule } from "@angular/common/http";
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { of } from "rxjs";


describe('SearchPageComponent',() => {
    let component: SearchPageComponent;
    let fixture: ComponentFixture<SearchPageComponent>;
    let githubService: GithubService;
    
    beforeEach(async ()=>{
        await TestBed.configureTestingModule ({
            declarations: [SearchPageComponent],
            providers: [GithubService],
            imports: [HttpClientModule, NgxPaginationModule, FormsModule]
        }).compileComponents();
    });

    beforeEach(() => {

        // Create a component fixture 
        fixture = TestBed.createComponent(SearchPageComponent);
        component = fixture.componentInstance;

        // injects the service
        githubService = TestBed.inject(GithubService); 
        
        // Detect changes
        fixture.detectChanges();
    });

    // Test
    it('should fetch projects and update the variables', ()=> {
        // Mock data
        const mockResponse = {
            items: [
            {id: 1, name: 'project a'},
            {id: 2, name: 'project b'}
        ],
        total_count: 2
    };

    const projectQuery = 'batata';
    const page = 1;


    spyOn(githubService, 'searchProjects').and.returnValue(of(mockResponse));

    // Set the value of search = projectQuery
    component.search = projectQuery;

    // Trigger the searchProject
    component.searchProject(false);

    
    // Check that the searchProjects method was called with the correct arguments
    expect(githubService.searchProjects).toHaveBeenCalledWith(projectQuery, component.currentPage);

    // Check that the projects and pageCount variables were updated with the mock response
    expect(component.projects).toEqual(mockResponse.items);
    expect(component.pageCount).toEqual(mockResponse.total_count);
    expect(component.currentPage).toEqual(1);
    });

    
  // Test searchIssue method
  it('should fetch issues and update the variables of search', () => {
    // Mock data
    const mockResponse = {
      items: [
        { id: 1, title: 'issue a' },
        { id: 2, title: 'issue b' }
      ],
      total_count: 2
    };

    const issueQuery = 'repo/example-repo';

    // Spy on the component
    spyOn(githubService, 'searchIssues').and.returnValue(of(mockResponse));

    // Set the mock data for issues
    component.issues = [{ id: 1, title: 'issue 1' }, { id: 2, title: 'issue 2' }];
    component.issuesPage = 1;
    component.currentIssue = issueQuery;

    // Trigger the searchIssue method with the mock issueQuery
    component.searchIssue(issueQuery);

    // Check that the searchIssues method was called with the correct arguments
    expect(githubService.searchIssues).toHaveBeenCalledWith(issueQuery, component.issuesPage);

    // Check that the issues, totalIssues, and currentIssue variables were updated with the mock response
    expect(component.issues).toEqual(mockResponse.items);
    expect(component.totalIssues).toEqual(mockResponse.total_count);
    expect(component.currentIssue).toEqual(issueQuery);
  });
    
});